import { getDb, withTransaction, type DbExecutor } from "@voyzu/capability/db";
import { ConflictError, DataError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { internalApi } from "@voyzu/capability/internal-api";
import { createCreationAuditStamp, createUpdateAuditStamp, withAuditActors, withCreationAudit, withUpdateAudit } from "@voyzu/organization/common/server";
import type {
  OrganizationBatchPatchRequestDto,
  OrganizationBatchUpdateRequestDto,
  OrganizationCreateRequestDto,
  OrganizationPatchRequestDto,
  OrganizationResponseDto,
  OrganizationUpdateRequestDto,
} from "@voyzu/organization/types/modules/organizations";
import type { Filter, ListOptions } from "@voyzu/types/params";

import { OrganizationRepo } from "../db/organization.repo";
import type { OrganizationRow } from "../db/organization.row.types";
import { toDto, toInsertRow, toPatchRow, toUpdateRow } from "./organization.mapper";

async function enrichRow(row: OrganizationRow): Promise<OrganizationResponseDto> {
  return withAuditActors(toDto(row), row);
}

function enrichRows(rows: OrganizationRow[]): Promise<OrganizationResponseDto[]> {
  return Promise.all(rows.map(enrichRow));
}

function normalizeCodes(codes: string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

function translateWriteError(error: unknown, notFoundMessage?: string): never {
  if (error instanceof DataError && notFoundMessage) throw new NotFoundError(notFoundMessage);
  if (error instanceof Error && error.message.includes("duplicate key value")) {
    throw new ConflictError("An organization with this code already exists");
  }
  throw error;
}

export async function createOrganization(input: OrganizationCreateRequestDto): Promise<OrganizationResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = toInsertRow(input);
      const created = await new OrganizationRepo(db).insert(withCreationAudit(row, await createCreationAuditStamp()));
      const organization = await enrichRow(created);
      await internalApi.callOptional("@erp/organization-finance", "createFinancialEntity", { organization_id: organization.id });
      return organization;
    });
  } catch (error) {
    return translateWriteError(error);
  }
}

export async function getOrganization(code: string): Promise<OrganizationResponseDto | null> {
  const row = await new OrganizationRepo(getDb()).get(code.trim().toUpperCase());
  return row ? enrichRow(row) : null;
}

export async function updateOrganization(code: string, input: OrganizationUpdateRequestDto): Promise<OrganizationResponseDto> {
  try {
    const row = await new OrganizationRepo(getDb()).update(
      code.trim().toUpperCase(),
      withUpdateAudit(toUpdateRow(input), await createUpdateAuditStamp()),
    );
    return enrichRow(row);
  } catch (error) {
    return translateWriteError(error, `Organization ${code} not found`);
  }
}

export async function patchOrganization(code: string, input: OrganizationPatchRequestDto): Promise<OrganizationResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new OrganizationRepo(db).patch(
        code.trim().toUpperCase(),
        withUpdateAudit(toPatchRow(input), await createUpdateAuditStamp()),
      );
      const organization = await enrichRow(row);
      return organization;
    });
  } catch (error) {
    return translateWriteError(error, `Organization ${code} not found`);
  }
}

export async function deleteOrganization(code: string): Promise<void> {
  await withTransaction(async (db) => {
    const normalized = code.trim().toUpperCase();
    const repo = new OrganizationRepo(db);
    const row = await repo.get(normalized);
    if (!row) throw new NotFoundError(`Organization ${normalized} not found`);
    // Dependent package records are removed by their upstream foreign-key cascades.
    await repo.delete(normalized);
  });
}

export async function listOrganizations(): Promise<OrganizationResponseDto[]> {
  return enrichRows(await new OrganizationRepo(getDb()).listAll());
}

export async function filterOrganizations(filters: Filter[], options?: ListOptions): Promise<OrganizationResponseDto[]> {
  return enrichRows(await new OrganizationRepo(getDb()).filter(filters, options));
}

export async function searchOrganizations(phrase: string, options?: ListOptions): Promise<OrganizationResponseDto[]> {
  return enrichRows(await new OrganizationRepo(getDb()).search(phrase, options));
}

export async function batchCreateOrganizations(inputs: OrganizationCreateRequestDto[]): Promise<OrganizationResponseDto[]> {
  try {
    return await withTransaction(async (db) => {
      const repo = new OrganizationRepo(db);
      const audit = await createCreationAuditStamp();
      const rows: OrganizationRow[] = [];
      for (const input of inputs) {
        const row = await repo.insert(withCreationAudit(toInsertRow(input), audit));
        const organization = await enrichRow(row);
        await internalApi.callOptional("@erp/organization-finance", "createFinancialEntity", { organization_id: organization.id });
        rows.push(row);
      }
      return enrichRows(rows);
    });
  } catch (error) {
    return translateWriteError(error);
  }
}

export async function batchGetOrganizations(codes: string[]): Promise<OrganizationResponseDto[]> {
  return enrichRows(await new OrganizationRepo(getDb()).batchGet(normalizeCodes(codes)));
}

export async function batchUpdateOrganizations(inputs: OrganizationBatchUpdateRequestDto[]): Promise<OrganizationResponseDto[]> {
  try {
    return await withTransaction(async (db) => {
      const repo = new OrganizationRepo(db);
      const audit = await createUpdateAuditStamp();
      const rows: OrganizationRow[] = [];
      for (const input of inputs) rows.push(await repo.update(input.code, withUpdateAudit(toUpdateRow(input), audit)));
      return enrichRows(rows);
    });
  } catch (error) {
    return translateWriteError(error, "One or more organizations not found");
  }
}

export async function batchPatchOrganizations(inputs: OrganizationBatchPatchRequestDto[]): Promise<OrganizationResponseDto[]> {
  try {
    return await withTransaction(async (db) => {
      const repo = new OrganizationRepo(db);
      const audit = await createUpdateAuditStamp();
      const rows: OrganizationRow[] = [];
      for (const input of inputs) {
        const { code, ...patch } = input;
        rows.push(await repo.patch(code, withUpdateAudit(toPatchRow(patch), audit)));
      }
      return enrichRows(rows);
    });
  } catch (error) {
    return translateWriteError(error, "One or more organizations not found");
  }
}

export async function batchDeleteOrganizations(codes: string[]): Promise<void> {
  const normalized = normalizeCodes(codes);
  if (!normalized.length) throw new InputValidationError("At least one organization code is required");
  await withTransaction(async (db) => {
    const repo = new OrganizationRepo(db);
    const rows = await repo.batchGet(normalized);
    const found = new Set(rows.map((row) => row.code));
    const missing = normalized.filter((code) => !found.has(code));
    if (missing.length) throw new NotFoundError(`Organization ${missing.join(", ")} not found`);
    // Dependent package records are removed by their upstream foreign-key cascades.
    await repo.batchDelete(normalized);
  });
}

async function transitionStatus(codes: string[], status: "ACTIVE" | "INACTIVE"): Promise<OrganizationResponseDto[]> {
  const normalized = normalizeCodes(codes);
  if (!normalized.length) throw new InputValidationError("At least one organization code is required");
  return withTransaction(async (db) => {
    const repo = new OrganizationRepo(db);
    const existing = await repo.batchGet(normalized);
    const found = new Set(existing.map((row) => row.code));
    const missing = normalized.filter((code) => !found.has(code));
    if (missing.length) throw new NotFoundError(`Organization ${missing.join(", ")} not found`);
    const organizations = await enrichRows(
      await repo.batchUpdateStatus(normalized, status, await createUpdateAuditStamp()),
    );
    // Finance derives availability from the owning organization's status.
    return organizations;
  });
}

export function activateOrganizations(codes: string[]): Promise<OrganizationResponseDto[]> { return transitionStatus(codes, "ACTIVE"); }
export function deactivateOrganizations(codes: string[]): Promise<OrganizationResponseDto[]> { return transitionStatus(codes, "INACTIVE"); }
export async function activateOrganization(code: string): Promise<OrganizationResponseDto> { return (await activateOrganizations([code]))[0]; }
export async function deactivateOrganization(code: string): Promise<OrganizationResponseDto> { return (await deactivateOrganizations([code]))[0]; }

export async function getOrganizationById(id: number): Promise<OrganizationResponseDto | null> {
  const rows = await new OrganizationRepo(getDb()).filter([{ field: "id", operator: "=", value: id }]);
  return rows[0] ? enrichRow(rows[0]) : null;
}
