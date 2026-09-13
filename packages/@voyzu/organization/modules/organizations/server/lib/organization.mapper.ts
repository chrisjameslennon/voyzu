import type { OrganizationCreateRequestDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationPatchRequestDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationUpdateRequestDto } from "@voyzu/organization/types/modules/organizations";

import type { OrganizationRow, InsertOrganizationRow, UpdateOrganizationRow, PatchOrganizationRow } from "../db/organization.row.types";

export function toDto(row: OrganizationRow): OrganizationResponseDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    countryCode: row.country_code,
    ...(row.country_name != null && { country: { code: row.country_code, name: row.country_name } }),
    baseCurrencyCode: row.base_currency_code,
    ...(row.currency_name != null && { baseCurrency: { code: row.base_currency_code, name: row.currency_name } }),
    status: row.status as OrganizationResponseDto["status"],
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

export function toInsertRow(input: OrganizationCreateRequestDto): InsertOrganizationRow {
  return {
    code: input.code,
    name: input.name,
    country_code: input.countryCode,
    base_currency_code: input.baseCurrencyCode,
  };
}

export function toUpdateRow(input: OrganizationUpdateRequestDto): UpdateOrganizationRow {
  return {
    code: input.code.trim().toUpperCase(),
    name: input.name,
    country_code: input.countryCode,
    base_currency_code: input.baseCurrencyCode,
  };
}

export function toPatchRow(input: OrganizationPatchRequestDto): PatchOrganizationRow {
  const row: PatchOrganizationRow = {};
  if (input.code !== undefined) row.code = input.code.trim().toUpperCase();
  if (input.name !== undefined) row.name = input.name;
  if (input.countryCode !== undefined) row.country_code = input.countryCode;
  if (input.baseCurrencyCode !== undefined) row.base_currency_code = input.baseCurrencyCode;
  return row;
}
