import type {
  CountryCreateRequestDto,
  CountryPatchRequestDto,
  CountryResponseDto,
  CountryUpdateRequestDto,
} from "@voyzu/organization/types/modules/countries";

import type { CountryRow, InsertCountryRow, PatchCountryRow, UpdateCountryRow } from "../db/country.row.types";

export function toInsertRow(input: CountryCreateRequestDto): InsertCountryRow {
  return {
    code: input.code,
    name: input.name,
    currency_code: input.currencyCode,
    ...(input.taxFilingAnchorMonth !== undefined && { tax_filing_anchor_month: input.taxFilingAnchorMonth }),
    ...(input.taxFilingIntervalMonths !== undefined && { tax_filing_interval_months: input.taxFilingIntervalMonths }),
  };
}

export function toUpdateRow(input: CountryUpdateRequestDto): UpdateCountryRow {
  return {
    name: input.name,
    currency_code: input.currencyCode,
    tax_filing_anchor_month: input.taxFilingAnchorMonth ?? 3,
    tax_filing_interval_months: input.taxFilingIntervalMonths ?? 3,
  };
}

export function toPatchRow(input: CountryPatchRequestDto): PatchCountryRow {
  const row: PatchCountryRow = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.currencyCode !== undefined) row.currency_code = input.currencyCode;
  if (input.taxFilingAnchorMonth !== undefined) row.tax_filing_anchor_month = input.taxFilingAnchorMonth;
  if (input.taxFilingIntervalMonths !== undefined) row.tax_filing_interval_months = input.taxFilingIntervalMonths;
  return row;
}

export function toDto(row: CountryRow): CountryResponseDto {
  return {
    id: row.code,
    code: row.code,
    name: row.name,
    currencyCode: row.currency_code,
    currency: {
      code: row.currency_code,
      name: row.currency_name,
    },
    financialPeriodStartMonth: row.financial_period_start_month ?? null,
    taxFilingAnchorMonth: row.tax_filing_anchor_month,
    taxFilingIntervalMonths: row.tax_filing_interval_months as CountryResponseDto["taxFilingIntervalMonths"],
    status: row.status as CountryResponseDto["status"],
    hasPostings: row.has_postings,
    linkedBy: row.linked_by,
    audit: {
      created: {
        date: row.creation_date,
        actorType: row.creation_actor_type,
        userId: row.creation_user_id,
        mutationId: row.creation_mutation_id,
      },
      updated: {
        date: row.updated_date,
        actorType: row.updated_actor_type,
        userId: row.updated_user_id,
        mutationId: row.updated_mutation_id,
      },
    },
  };
}
