import { getDb, withTransaction } from "@voyzu/capability/db";
import { BusinessRuleError, ConflictError, DataError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { createCreationAuditStamp, createUpdateAuditStamp, withAuditActors, withCreationAudit, withUpdateAudit } from "@voyzu/organization/common/server";
import type {
  CountryBatchPatchRequestDto,
  CountryBatchUpdateRequestDto,
  CountryCreateRequestDto,
  CountryPatchRequestDto,
  CountryResponseDto,
  CountryTaxAuthorityResponseDto,
  CountryTaxComponentResponseDto,
  CountryTaxRuleResponseDto,
  CountryUpdateRequestDto,
} from "@voyzu/organization/types/modules/countries";
import type { Filter, ListOptions } from "@voyzu/types/params";

import { Deactivate, Delete } from "../../domain/operation-policy";
import { CountryRepo } from "../db/country.repo";
import type { CountryRow } from "../db/country.row.types";

import { toDto, toInsertRow, toPatchRow, toUpdateRow } from "./country.mapper";

async function enrichRow(row: CountryRow): Promise<CountryResponseDto> {
  return withAuditActors(toDto(row), row);
}

function enrichRows(rows: CountryRow[]): Promise<CountryResponseDto[]> {
  return Promise.all(rows.map((row) => enrichRow(row)));
}

function normalizeCodes(codes: string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

function throwIfBlocked(blockers: ReturnType<typeof Delete>): void {
  if (blockers.length) throw new BusinessRuleError(blockers.map((blocker) => blocker.message).join("; "));
}

type CountryTaxConfiguration = Pick<CountryResponseDto, "taxAuthorities" | "taxRules" | "taxComponents">;

function emptyTaxConfiguration(): CountryTaxConfiguration {
  return { taxAuthorities: [], taxRules: [], taxComponents: [] };
}

async function getCountryTaxConfigurations(countryCodes: string[]): Promise<Map<string, CountryTaxConfiguration>> {
  const normalizedCountryCodes = normalizeCodes(countryCodes);
  const configurations = new Map(normalizedCountryCodes.map((code) => [code, emptyTaxConfiguration()]));
  if (normalizedCountryCodes.length === 0) return configurations;

  const db = getDb();

  const [authorities, rules, components] = await Promise.all([
    db.query(
      `SELECT country_code, id, code, name, region_code, jurisdiction_level, status
       FROM tax_authority
       WHERE country_code = ANY($1::text[]) AND status != 'DELETED'
       ORDER BY country_code ASC, region_code ASC NULLS FIRST, code ASC`,
      [normalizedCountryCodes],
    ),
    db.query(
      `SELECT country_code, id, code, name, region_code, invoice_label, calculation_method, component_count, status
       FROM tax_rule
       WHERE country_code = ANY($1::text[]) AND status != 'DELETED'
       ORDER BY country_code ASC, region_code ASC NULLS FIRST, code ASC`,
      [normalizedCountryCodes],
    ),
    db.query(
      `SELECT tr.country_code, tc.id, tc.code, tc.tax_rule_code, tc.tax_authority_code, tc.scheme_code, tc.invoice_label, tc.rate, tc.status
       FROM tax_component tc
       JOIN tax_rule tr ON tr.country_code = tc.tax_rule_country_code AND tr.code = tc.tax_rule_code
       WHERE tr.country_code = ANY($1::text[]) AND tc.status != 'DELETED'
       ORDER BY tr.country_code ASC, tc.tax_rule_code ASC, tc.calculation_order ASC, tc.code ASC`,
      [normalizedCountryCodes],
    ),
  ]);

  for (const row of authorities.rows as Array<Record<string, unknown>>) {
    configurations.get(String(row.country_code))?.taxAuthorities?.push({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      regionCode: row.region_code == null ? null : String(row.region_code),
      jurisdictionLevel: String(row.jurisdiction_level),
      status: row.status as CountryTaxAuthorityResponseDto["status"],
    });
  }
  for (const row of rules.rows as Array<Record<string, unknown>>) {
    configurations.get(String(row.country_code))?.taxRules?.push({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      regionCode: row.region_code == null ? null : String(row.region_code),
      invoiceLabel: String(row.invoice_label),
      calculationMethod: String(row.calculation_method),
      componentCount: Number(row.component_count),
      status: row.status as CountryTaxRuleResponseDto["status"],
    });
  }
  for (const row of components.rows as Array<Record<string, unknown>>) {
    configurations.get(String(row.country_code))?.taxComponents?.push({
      id: String(row.id),
      code: String(row.code),
      taxRuleCode: String(row.tax_rule_code),
      taxAuthorityCode: String(row.tax_authority_code),
      schemeCode: String(row.scheme_code),
      invoiceLabel: String(row.invoice_label),
      rate: Number(row.rate),
      status: row.status as CountryTaxComponentResponseDto["status"],
    });
  }

  return configurations;
}

async function getCountryTaxConfiguration(countryCode: string): Promise<CountryTaxConfiguration> {
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  return (await getCountryTaxConfigurations([normalizedCountryCode])).get(normalizedCountryCode) ?? emptyTaxConfiguration();
}

export async function createCountry(input: CountryCreateRequestDto): Promise<CountryResponseDto> {
  try {
    const row = await new CountryRepo(getDb()).insert(withCreationAudit(toInsertRow(input), await createCreationAuditStamp()));
    return enrichRow(row);
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key value")) {
      throw new ConflictError("A country with this code already exists");
    }
    throw error;
  }
}

export async function getCountry(code: string): Promise<CountryResponseDto | null> {
  const row = await new CountryRepo(getDb()).get(code);
  if (!row) return null;

  const dto = await enrichRow(row);
  const taxConfiguration = await getCountryTaxConfiguration(code);
  return { ...dto, ...taxConfiguration };
}

export async function updateCountry(code: string, input: CountryUpdateRequestDto): Promise<CountryResponseDto> {
  try {
    const row = await new CountryRepo(getDb()).update(code, {
      ...withUpdateAudit(toUpdateRow(input), await createUpdateAuditStamp()),
    });
    return enrichRow(row);
  } catch (error) {
    if (error instanceof DataError) throw new NotFoundError(`Country ${code} not found`);
    throw error;
  }
}

export async function patchCountry(code: string, input: CountryPatchRequestDto): Promise<CountryResponseDto> {
  try {
    const row = await new CountryRepo(getDb()).patch(code, {
      ...withUpdateAudit(toPatchRow(input), await createUpdateAuditStamp()),
    });
    return enrichRow(row);
  } catch (error) {
    if (error instanceof DataError) throw new NotFoundError(`Country ${code} not found`);
    throw error;
  }
}

export async function deleteCountry(code: string): Promise<void> {
  const repo = new CountryRepo(getDb());
  const existing = await repo.get(code);
  if (!existing) throw new NotFoundError(`Country ${code} not found`);
  throwIfBlocked(Delete({ code: existing.code, linkedBy: existing.linked_by }));
  await repo.delete(code);
}

export async function listCountries(): Promise<CountryResponseDto[]> {
  const rows = await new CountryRepo(getDb()).listAll();
  return enrichRows(rows);
}

export async function listCountriesWithTaxConfiguration(): Promise<CountryResponseDto[]> {
  const countries = await listCountries();
  const configurations = await getCountryTaxConfigurations(countries.map((country) => country.code));
  return countries.map((country) => ({
    ...country,
    ...(configurations.get(country.code) ?? emptyTaxConfiguration()),
  }));
}

export async function filterCountries(filters: Filter[], options?: ListOptions): Promise<CountryResponseDto[]> {
  const rows = await new CountryRepo(getDb()).filter(filters, options);
  return enrichRows(rows);
}

export async function searchCountries(phrase: string, options?: ListOptions): Promise<CountryResponseDto[]> {
  const rows = await new CountryRepo(getDb()).search(phrase, options);
  return enrichRows(rows);
}
export async function batchCreateCountries(inputs: CountryCreateRequestDto[]): Promise<CountryResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new CountryRepo(client);
      const results: CountryResponseDto[] = [];
      const audit = await createCreationAuditStamp();
      for (const input of inputs) {
        results.push(await enrichRow(await repo.insert(withCreationAudit(toInsertRow(input), audit))));
      }
      return results;
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key value")) {
      throw new ConflictError("One or more country codes already exist");
    }
    throw error;
  }
}

export async function batchGetCountries(codes: string[]): Promise<CountryResponseDto[]> {
  const rows = await new CountryRepo(getDb()).batchGet(codes);
  return enrichRows(rows);
}

export async function batchUpdateCountries(inputs: CountryBatchUpdateRequestDto[]): Promise<CountryResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new CountryRepo(client);
      const results: CountryResponseDto[] = [];
      const audit = await createUpdateAuditStamp();
      for (const input of inputs) {
        results.push(await enrichRow(await repo.update(input.code, withUpdateAudit(toUpdateRow(input), audit))));
      }
      return results;
    });
  } catch (error) {
    if (error instanceof DataError) throw new NotFoundError("One or more countries not found");
    throw error;
  }
}

export async function batchPatchCountries(inputs: CountryBatchPatchRequestDto[]): Promise<CountryResponseDto[]> {
  try {
    return await withTransaction(async (client) => {
      const repo = new CountryRepo(client);
      const results: CountryResponseDto[] = [];
      const audit = await createUpdateAuditStamp();
      for (const input of inputs) {
        results.push(await enrichRow(await repo.patch(input.code, withUpdateAudit(toPatchRow(input), audit))));
      }
      return results;
    });
  } catch (error) {
    if (error instanceof DataError) throw new NotFoundError("One or more countries not found");
    throw error;
  }
}

export async function batchDeleteCountries(codes: string[]): Promise<void> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one country code is required");

  const repo = new CountryRepo(getDb());
  const existing = await repo.batchGet(normalizedCodes);
  const found = new Set(existing.map((country) => country.code));
  const missing = normalizedCodes.filter((code) => !found.has(code));
  if (missing.length > 0) throw new NotFoundError(`Country ${missing.join(", ")} not found`);

  for (const country of existing) throwIfBlocked(Delete({ code: country.code, linkedBy: country.linked_by }));

  await repo.batchDelete(normalizedCodes);
}

export async function activateCountry(code: string): Promise<CountryResponseDto> {
  const [country] = await activateCountries([code]);
  return country;
}

export async function deactivateCountry(code: string): Promise<CountryResponseDto> {
  const [country] = await deactivateCountries([code]);
  return country;
}

export async function activateCountries(codes: string[]): Promise<CountryResponseDto[]> {
  return transitionCountryStatus(codes, "ACTIVE");
}

export async function deactivateCountries(codes: string[]): Promise<CountryResponseDto[]> {
  return transitionCountryStatus(codes, "INACTIVE");
}

async function transitionCountryStatus(codes: string[], targetStatus: "ACTIVE" | "INACTIVE"): Promise<CountryResponseDto[]> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one country code is required");

  const audit = await createUpdateAuditStamp();
  return withTransaction(async (client) => {
    const repo = new CountryRepo(client);
    const existing = await repo.batchGet(normalizedCodes);
    const found = new Set(existing.map((country) => country.code));
    const missing = normalizedCodes.filter((code) => !found.has(code));
    if (missing.length > 0) throw new NotFoundError(`Country ${missing.join(", ")} not found`);

    if (targetStatus === "INACTIVE") {
      for (const country of existing) throwIfBlocked(Deactivate({ code: country.code, linkedBy: country.linked_by }));
    }

    const rows = await repo.batchUpdateStatus(normalizedCodes, targetStatus, audit);
    return enrichRows(rows);
  });
}
