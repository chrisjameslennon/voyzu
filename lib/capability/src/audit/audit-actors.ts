import "server-only";
import type { AuditUserDto } from "@voyzu/types/modules/core";
import { capabilities } from "../contracts";

export async function getAuditActor(userId: string | null | undefined): Promise<AuditUserDto | null> {
  if (!userId) return null;
  const parsed = Number(userId);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  const { users } = await capabilities.use("platform.identity").lookup({ ids: [parsed] });
  return users[0] ?? null;
}

export async function getAuditActors(row: {
  creation_user_id?: string | null;
  updated_user_id?: string | null;
}): Promise<{
  creationUser: AuditUserDto | null;
  updatedUser: AuditUserDto | null;
}> {
  const ids = [...new Set([row.creation_user_id, row.updated_user_id].map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  const users = ids.length ? (await capabilities.use("platform.identity").lookup({ ids })).users : [];
  return {
    creationUser: users.find((user) => user.id === Number(row.creation_user_id)) ?? null,
    updatedUser: users.find((user) => user.id === Number(row.updated_user_id)) ?? null,
  };
}

export async function withAuditActors<T extends {
  audit: {
    created: { user?: AuditUserDto | null };
    updated: { user?: AuditUserDto | null };
  };
}>(dto: T, row: {
  creation_user_id?: string | null;
  updated_user_id?: string | null;
}): Promise<T> {
  const { creationUser, updatedUser } = await getAuditActors(row);
  return {
    ...dto,
    audit: {
      ...dto.audit,
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
