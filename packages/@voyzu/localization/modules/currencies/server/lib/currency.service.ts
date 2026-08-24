import { getDb, withTransaction, type DbExecutor } from "@voyzu/capability/db";
import { BusinessRuleError, ConflictError, DataError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { events as platformEvents } from "@voyzu/capability/events";
import { createCreationAuditStamp, createUpdateAuditStamp, withAuditActors, withCreationAudit, withUpdateAudit } from "@voyzu/localization/common/server";
import type { CurrencyBatchPatchRequestDto, CurrencyBatchUpdateRequestDto, CurrencyCreateRequestDto, CurrencyPatchRequestDto, CurrencyResponseDto, CurrencyUpdateRequestDto } from "@voyzu/localization/types/modules/currencies";
import type { Filter, ListOptions } from "@voyzu/types/params";

import { Deactivate, Delete } from "../../domain/operation-policy";
import { events } from "../../events";
import { CurrencyRepo } from "../db/currency.repo";
import type { CurrencyRow } from "../db/currency.row.types";

import { toDto, toInsertRow, toPatchRow, toUpdateRow } from "./currency.mapper";

async function enrichRow(row: CurrencyRow): Promise<CurrencyResponseDto> {
  return await withAuditActors(toDto(row), row);
}

function enrichRows(rows: CurrencyRow[]): Promise<CurrencyResponseDto[]> {
  return Promise.all(rows.map((r) => enrichRow(r)));
}

function normalizeCodes(codes: string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

function throwIfBlocked(blockers: ReturnType<typeof Delete>): void {
  if (blockers.length) throw new BusinessRuleError(blockers.map((blocker) => blocker.message).join("; "));
}


export async function listCurrencies(): Promise<CurrencyResponseDto[]> {
  const rows = await new CurrencyRepo(getDb()).listAll();
  return enrichRows(rows);
}

export async function filterCurrencies(filters: Filter[], options?: ListOptions): Promise<CurrencyResponseDto[]> {
  const rows = await new CurrencyRepo(getDb()).filter(filters, options);
  return enrichRows(rows);
}

export async function searchCurrencies(phrase: string, options?: ListOptions): Promise<CurrencyResponseDto[]> {
  const rows = await new CurrencyRepo(getDb()).search(phrase, options);
  return enrichRows(rows);
}


export async function getCurrency(code: string): Promise<CurrencyResponseDto | null> {
  const row = await new CurrencyRepo(getDb()).get(code);
  if (!row) return null;
  return enrichRow(row);
}

export async function createCurrency(input: CurrencyCreateRequestDto): Promise<CurrencyResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new CurrencyRepo(db).insert(withCreationAudit(toInsertRow(input), await createCreationAuditStamp()));
      const currency = await enrichRow(row);
      await platformEvents.dispatch(events.currencyCreated, currency, { transaction: db });
      return currency;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A currency with this code already exists");
    }
    throw err;
  }
}

export async function updateCurrency(code: string, input: CurrencyUpdateRequestDto): Promise<CurrencyResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new CurrencyRepo(db).update(code, withUpdateAudit(toUpdateRow(input), await createUpdateAuditStamp()));
      const currency = await enrichRow(row);
      await platformEvents.dispatch(events.currencyUpdated, currency, { transaction: db });
      return currency;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError(`Currency ${code} not found`);
    }
    throw err;
  }
}

export async function patchCurrency(code: string, input: CurrencyPatchRequestDto): Promise<CurrencyResponseDto> {
  try {
    return await withTransaction(async (db) => {
      const row = await new CurrencyRepo(db).patch(code, withUpdateAudit(toPatchRow(input), await createUpdateAuditStamp()));
      const currency = await enrichRow(row);
      await platformEvents.dispatch(events.currencyUpdated, currency, { transaction: db });
      return currency;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError(`Currency ${code} not found`);
    }
    throw err;
  }
}

export async function deleteCurrency(code: string): Promise<void> {
  await withTransaction(async (db) => {
    const repo = new CurrencyRepo(db);
    const existing = await repo.get(code);
    if (!existing) throw new NotFoundError(`Currency ${code} not found`);
    throwIfBlocked(Delete({ code: existing.code }));
    const currency = await enrichRow(existing);
    await platformEvents.dispatch(events.currencyDeleted, currency, { transaction: db });
    await repo.delete(code);
  });
}


export async function batchCreateCurrencies(inputs: CurrencyCreateRequestDto[]): Promise<CurrencyResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new CurrencyRepo(client);
      const results: CurrencyResponseDto[] = [];
      const audit = await createCreationAuditStamp();
      for (const input of inputs) {
        const row = await repo.insert(withCreationAudit(toInsertRow(input), audit));
        results.push(await enrichRow(row));
      }
      await platformEvents.dispatch(events.currenciesCreated, results, { transaction: client });
      return results;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more codes already exist");
    }
    throw err;
  }
}

export async function batchGetCurrencies(codes: string[]): Promise<CurrencyResponseDto[]> {
  const rows = await new CurrencyRepo(getDb()).batchGet(codes);
  return enrichRows(rows);
}

export async function batchUpdateCurrencies(inputs: CurrencyBatchUpdateRequestDto[]): Promise<CurrencyResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new CurrencyRepo(client);
      const results: CurrencyResponseDto[] = [];
      const audit = await createUpdateAuditStamp();
      for (const input of inputs) {
        const row = await repo.update(input.code, withUpdateAudit(toUpdateRow(input), audit));
        results.push(await enrichRow(row));
      }
      await platformEvents.dispatch(events.currenciesUpdated, results, { transaction: client });
      return results;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError("One or more currencies not found");
    }
    throw err;
  }
}

export async function batchPatchCurrencies(inputs: CurrencyBatchPatchRequestDto[]): Promise<CurrencyResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new CurrencyRepo(client);
      const results: CurrencyResponseDto[] = [];
      const audit = await createUpdateAuditStamp();
      for (const input of inputs) {
        const row = await repo.patch(input.code, withUpdateAudit(toPatchRow(input), audit));
        results.push(await enrichRow(row));
      }
      await platformEvents.dispatch(events.currenciesUpdated, results, { transaction: client });
      return results;
    });
  } catch (err) {
    if (err instanceof DataError) {
      throw new NotFoundError("One or more currencies not found");
    }
    throw err;
  }
}

export async function batchDeleteCurrencies(codes: string[]): Promise<void> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one currency code is required");

  await withTransaction(async (db) => {
    const repo = new CurrencyRepo(db);
    const existing = await repo.batchGet(normalizedCodes);
    const found = new Set(existing.map((currency) => currency.code));
    const missing = normalizedCodes.filter((code) => !found.has(code));
    if (missing.length > 0) throw new NotFoundError(`Currency ${missing.join(", ")} not found`);

    for (const currency of existing) throwIfBlocked(Delete({ code: currency.code }));

    const currencies = await enrichRows(existing);
    await platformEvents.dispatch(events.currenciesDeleted, currencies, { transaction: db });
    await repo.batchDelete(normalizedCodes);
  });
}

export async function activateCurrency(code: string): Promise<CurrencyResponseDto> {
  return withTransaction(async (db) => {
    const [currency] = await transitionCurrencyStatus(db, [code], "ACTIVE");
    await platformEvents.dispatch(events.currencyActivated, currency, { transaction: db });
    return currency;
  });
}

export async function deactivateCurrency(code: string): Promise<CurrencyResponseDto> {
  return withTransaction(async (db) => {
    const [currency] = await transitionCurrencyStatus(db, [code], "INACTIVE");
    await platformEvents.dispatch(events.currencyDeactivated, currency, { transaction: db });
    return currency;
  });
}

export async function activateCurrencies(codes: string[]): Promise<CurrencyResponseDto[]> {
  return withTransaction(async (db) => {
    const currencies = await transitionCurrencyStatus(db, codes, "ACTIVE");
    await platformEvents.dispatch(events.currenciesActivated, currencies, { transaction: db });
    return currencies;
  });
}

export async function deactivateCurrencies(codes: string[]): Promise<CurrencyResponseDto[]> {
  return withTransaction(async (db) => {
    const currencies = await transitionCurrencyStatus(db, codes, "INACTIVE");
    await platformEvents.dispatch(events.currenciesDeactivated, currencies, { transaction: db });
    return currencies;
  });
}

async function transitionCurrencyStatus(
  db: DbExecutor,
  codes: string[],
  targetStatus: "ACTIVE" | "INACTIVE",
): Promise<CurrencyResponseDto[]> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one currency code is required");

  const audit = await createUpdateAuditStamp();
  const repo = new CurrencyRepo(db);
  const existing = await repo.batchGet(normalizedCodes);
  const found = new Set(existing.map((currency) => currency.code));
  const missing = normalizedCodes.filter((code) => !found.has(code));
  if (missing.length > 0) throw new NotFoundError(`Currency ${missing.join(", ")} not found`);
  if (targetStatus === "INACTIVE") {
    for (const currency of existing) throwIfBlocked(Deactivate({ code: currency.code }));
  }
  const rows = await repo.batchUpdateStatus(normalizedCodes, targetStatus, audit);
  return enrichRows(rows);
}
