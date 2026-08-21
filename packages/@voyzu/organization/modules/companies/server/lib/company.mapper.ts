import type { CompanyCreateRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyPatchRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyUpdateRequestDto } from "@voyzu/organization/types/modules/companies";

import type { CompanyRow, InsertCompanyRow, UpdateCompanyRow, PatchCompanyRow } from "../db/company.row.types";

export function toDto(row: CompanyRow): CompanyResponseDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    countryCode: row.country_code,
    ...(row.country_name != null && { country: { code: row.country_code, name: row.country_name } }),
    baseCurrencyCode: row.base_currency_code,
    ...(row.currency_name != null && { baseCurrency: { code: row.base_currency_code, name: row.currency_name } }),
    taxFilingAnchorMonth: row.tax_filing_anchor_month,
    taxFilingIntervalMonths: row.tax_filing_interval_months as CompanyResponseDto["taxFilingIntervalMonths"],
    useOrganizationStandardSettings: row.use_organization_standard_settings,
    ...(row.report_line_1 != null && { reportLine1: row.report_line_1 }),
    ...(row.report_line_2 != null && { reportLine2: row.report_line_2 }),
    ...(row.report_footer != null && { reportFooter: row.report_footer }),
    status: row.status as CompanyResponseDto["status"],
    hasPostings: row.has_postings,
    audit: {
      created: {
        date: row.creation_date,
        actorType: row.creation_actor_type,
        ...(row.creation_user_id != null && { userId: row.creation_user_id }),
        mutationId: row.creation_mutation_id,
      },
      updated: {
        date: row.updated_date,
        actorType: row.updated_actor_type,
        ...(row.updated_user_id != null && { userId: row.updated_user_id }),
        mutationId: row.updated_mutation_id,
      },
    },
  };
}

export function toInsertRow(input: CompanyCreateRequestDto): InsertCompanyRow {
  return {
    code: input.code,
    name: input.name,
    country_code: input.countryCode,
    base_currency_code: input.baseCurrencyCode,
    ...(input.taxFilingAnchorMonth !== undefined && { tax_filing_anchor_month: input.taxFilingAnchorMonth }),
    ...(input.taxFilingIntervalMonths !== undefined && { tax_filing_interval_months: input.taxFilingIntervalMonths }),
    use_organization_standard_settings: input.useOrganizationStandardSettings ?? true,
    ...(input.reportLine1 !== undefined && { report_line_1: input.reportLine1 }),
    ...(input.reportLine2 !== undefined && { report_line_2: input.reportLine2 }),
    ...(input.reportFooter !== undefined && { report_footer: input.reportFooter }),
  };
}

export function toUpdateRow(input: CompanyUpdateRequestDto): UpdateCompanyRow {
  return {
    code: input.code.trim().toUpperCase(),
    name: input.name,
    country_code: input.countryCode,
    base_currency_code: input.baseCurrencyCode,
    tax_filing_anchor_month: input.taxFilingAnchorMonth ?? 3,
    tax_filing_interval_months: input.taxFilingIntervalMonths ?? 3,
    use_organization_standard_settings: input.useOrganizationStandardSettings ?? true,
    report_line_1: input.reportLine1 ?? null,
    report_line_2: input.reportLine2 ?? null,
    report_footer: input.reportFooter ?? null,
  };
}

export function toPatchRow(input: CompanyPatchRequestDto): PatchCompanyRow {
  const row: PatchCompanyRow = {};
  if (input.code !== undefined) row.code = input.code.trim().toUpperCase();
  if (input.name !== undefined) row.name = input.name;
  if (input.countryCode !== undefined) row.country_code = input.countryCode;
  if (input.baseCurrencyCode !== undefined) row.base_currency_code = input.baseCurrencyCode;
  if (input.taxFilingAnchorMonth !== undefined) row.tax_filing_anchor_month = input.taxFilingAnchorMonth;
  if (input.taxFilingIntervalMonths !== undefined) row.tax_filing_interval_months = input.taxFilingIntervalMonths;
  if (input.useOrganizationStandardSettings !== undefined) row.use_organization_standard_settings = input.useOrganizationStandardSettings;
  if (input.reportLine1 !== undefined) row.report_line_1 = input.reportLine1;
  if (input.reportLine2 !== undefined) row.report_line_2 = input.reportLine2;
  if (input.reportFooter !== undefined) row.report_footer = input.reportFooter;
  return row;
}
