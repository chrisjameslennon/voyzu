import { getDb, withTransaction, type DbExecutor } from "@voyzu/capability/db";
import { BusinessRuleError, ConflictError, DataError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { createCreationAuditStamp, createUpdateAuditStamp, withAuditActors, withCreationAudit, withUpdateAudit } from "@voyzu/party/common/server";
import type { PartyBatchPatchRequestDto, PartyBatchUpdateRequestDto, PartyCreateRequestDto, PartyPatchRequestDto, PartyResponseDto, PartyUpdateRequestDto } from "@voyzu/party/types/modules/parties";
import type { Filter, ListOptions } from "@voyzu/types/params";

import { Deactivate, Delete } from "../../domain/operation-policy";
import { PartyRepo } from "../db/party.repo";
import type { PartyRow } from "../db/party.row.types";

import { toDto, toInsertRow, toPatchRow, toUpdateRow } from "./party.mapper";

async function enrichRow(row: PartyRow): Promise<PartyResponseDto> {
  return await withAuditActors(toDto(row), row);
}

function enrichRows(rows: PartyRow[]): Promise<PartyResponseDto[]> {
  return Promise.all(rows.map((r) => enrichRow(r)));
}

function normalizeCodes(codes: string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

function throwIfBlocked(blockers: ReturnType<typeof Delete>): void {
  if (blockers.length) throw new BusinessRuleError(blockers.map((blocker) => blocker.message).join("; "));
}


export async function listParties(): Promise<PartyResponseDto[]> {
  const rows = await new PartyRepo(getDb()).listAll();
  return enrichRows(rows);
}

export async function filterParties(filters: Filter[], options?: ListOptions): Promise<PartyResponseDto[]> {
  const rows = await new PartyRepo(getDb()).filter(filters, options);
  return enrichRows(rows);
}

export async function searchParties(phrase: string, options?: ListOptions): Promise<PartyResponseDto[]> {
  const rows = await new PartyRepo(getDb()).search(phrase, options);
  return enrichRows(rows);
}


export async function getParty(code: string): Promise<PartyResponseDto | null> {
  const row = await new PartyRepo(getDb()).get(code);
  if (!row) return null;
  return enrichRow(row);
}

export async function createParty(input: PartyCreateRequestDto): Promise<PartyResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new PartyRepo(db).insert(withCreationAudit(toInsertRow(input), await createCreationAuditStamp()));
      const party = await enrichRow(row);
      return party;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A party with this code already exists");
    }
    throw err;
  }
}

export async function updateParty(code: string, input: PartyUpdateRequestDto): Promise<PartyResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new PartyRepo(db).update(code, withUpdateAudit(toUpdateRow(input), await createUpdateAuditStamp()));
      const party = await enrichRow(row);
      return party;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError(`Party ${code} not found`);
    }
    throw err;
  }
}

export async function patchParty(code: string, input: PartyPatchRequestDto): Promise<PartyResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new PartyRepo(db).patch(code, withUpdateAudit(toPatchRow(input), await createUpdateAuditStamp()));
      const party = await enrichRow(row);
      return party;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError(`Party ${code} not found`);
    }
    throw err;
  }
}

export async function deleteParty(code: string): Promise<void> {
  await withTransaction(async (db) => {
    const repo = new PartyRepo(db);
    const existing = await repo.get(code);
    if (!existing) throw new NotFoundError(`Party ${code} not found`);
    throwIfBlocked(Delete({ code: existing.code }));
    await repo.delete(code);
  });
}


export async function batchCreateParties(inputs: PartyCreateRequestDto[]): Promise<PartyResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new PartyRepo(client);
      const results: PartyResponseDto[] = [];
      const audit = await createCreationAuditStamp();
      for (const input of inputs) {
        const row = await repo.insert(withCreationAudit(toInsertRow(input), audit));
        results.push(await enrichRow(row));
      }
      return results;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more codes already exist");
    }
    throw err;
  }
}

export async function batchGetParties(codes: string[]): Promise<PartyResponseDto[]> {
  const rows = await new PartyRepo(getDb()).batchGet(codes);
  return enrichRows(rows);
}

export async function batchUpdateParties(inputs: PartyBatchUpdateRequestDto[]): Promise<PartyResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new PartyRepo(client);
      const results: PartyResponseDto[] = [];
      const audit = await createUpdateAuditStamp();
      for (const input of inputs) {
        const row = await repo.update(input.code, withUpdateAudit(toUpdateRow(input), audit));
        results.push(await enrichRow(row));
      }
      return results;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError("One or more parties not found");
    }
    throw err;
  }
}

export async function batchPatchParties(inputs: PartyBatchPatchRequestDto[]): Promise<PartyResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new PartyRepo(client);
      const results: PartyResponseDto[] = [];
      const audit = await createUpdateAuditStamp();
      for (const input of inputs) {
        const row = await repo.patch(input.code, withUpdateAudit(toPatchRow(input), audit));
        results.push(await enrichRow(row));
      }
      return results;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError("One or more parties not found");
    }
    throw err;
  }
}

export async function batchDeleteParties(codes: string[]): Promise<void> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one party code is required");

  await withTransaction(async (db) => {
    const repo = new PartyRepo(db);
    const existing = await repo.batchGet(normalizedCodes);
    const found = new Set(existing.map((party) => party.code));
    const missing = normalizedCodes.filter((code) => !found.has(code));
    if (missing.length > 0) throw new NotFoundError(`Party ${missing.join(", ")} not found`);

    for (const party of existing) throwIfBlocked(Delete({ code: party.code }));

    await repo.batchDelete(normalizedCodes);
  });
}

export async function activateParty(code: string): Promise<PartyResponseDto> {
  return withTransaction(async (db) => {
    const [party] = await transitionPartyStatus(db, [code], "ACTIVE");
    return party;
  });
}

export async function deactivateParty(code: string): Promise<PartyResponseDto> {
  return withTransaction(async (db) => {
    const [party] = await transitionPartyStatus(db, [code], "INACTIVE");
    return party;
  });
}

export async function activateParties(codes: string[]): Promise<PartyResponseDto[]> {
  return withTransaction(async (db) => {
    const parties = await transitionPartyStatus(db, codes, "ACTIVE");
    return parties;
  });
}

export async function deactivateParties(codes: string[]): Promise<PartyResponseDto[]> {
  return withTransaction(async (db) => {
    const parties = await transitionPartyStatus(db, codes, "INACTIVE");
    return parties;
  });
}

async function transitionPartyStatus(
  db: DbExecutor,
  codes: string[],
  targetStatus: "ACTIVE" | "INACTIVE",
): Promise<PartyResponseDto[]> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one party code is required");

  const audit = await createUpdateAuditStamp();
  const repo = new PartyRepo(db);
  const existing = await repo.batchGet(normalizedCodes);
  const found = new Set(existing.map((party) => party.code));
  const missing = normalizedCodes.filter((code) => !found.has(code));
  if (missing.length > 0) throw new NotFoundError(`Party ${missing.join(", ")} not found`);
  if (targetStatus === "INACTIVE") {
    for (const party of existing) throwIfBlocked(Deactivate({ code: party.code }));
  }
  const rows = await repo.batchUpdateStatus(normalizedCodes, targetStatus, audit);
  return enrichRows(rows);
}
