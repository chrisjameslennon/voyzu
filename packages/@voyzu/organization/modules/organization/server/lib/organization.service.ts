import { randomUUID } from "node:crypto";

import { BusinessRuleError } from "@voyzu/capability/errors";
import { ChangeCode } from "@voyzu/organization/organization/domain/operation-policy";
import type {
  OrganizationResponseDto,
  OrganizationUpdateRequestDto,
} from "@voyzu/organization/types/modules/organization";

import { getCurrentActorType, getCurrentUser, UserRepo } from "@voyzu/auth/users/server";
import { getDb } from "@voyzu/capability/db";

import { OrganizationRepo } from "../db/organization.repo";
import type { OrganizationRow } from "../db/organization.row.types";

import { toDto, toUpdateRow } from "./organization.mapper";

async function getAuditActor(
  repo: UserRepo,
  userId: string | null,
): Promise<OrganizationResponseDto["audit"]["created"]["user"]> {
  if (!userId) return null;
  const parsed = Number(userId);
  if (!Number.isInteger(parsed)) return null;
  const row = await repo.getById(parsed);
  return row
    ? {
      id: row.id,
      code: row.code,
      displayName: row.display_name,
    }
    : null;
}

async function enrich(row: OrganizationRow): Promise<OrganizationResponseDto> {
  const userRepo = new UserRepo(getDb());
  const [creationUser, updatedUser] = await Promise.all([
    getAuditActor(userRepo, row.creation_user_id),
    getAuditActor(userRepo, row.updated_user_id),
  ]);
  const dto = toDto(row);
  return {
    ...dto,
    audit: {
      created: {
        ...dto.audit.created,
        user: creationUser,
      },
      updated: {
        ...dto.audit.updated,
        user: updatedUser,
      },
    },
  };
}

export async function getOrganization(): Promise<OrganizationResponseDto | null> {
  const row = await new OrganizationRepo(getDb()).get();
  if (!row) return null;
  return await enrich(row);
}

export async function updateOrganization(input: OrganizationUpdateRequestDto): Promise<OrganizationResponseDto> {
  const repo = new OrganizationRepo(getDb());
  const existing = await repo.get();
  if (!existing) throw new Error("Organization not found");
  if (input.code !== undefined) {
    const blockers = ChangeCode({ code: existing.code, hasPostings: existing.has_postings }, input.code);
    if (blockers.length) throw new BusinessRuleError(blockers.map((blocker) => blocker.message).join("; "));
  }

  const currentUser = await getCurrentUser();
  const mutationId = randomUUID();
  const row = await repo.update(existing.id, {
    ...toUpdateRow(input),
    updated_actor_type: getCurrentActorType(),
    updated_user_id: currentUser ? String(currentUser.id) : null,
    updated_mutation_id: mutationId,
  });
  return await enrich(row);
}
