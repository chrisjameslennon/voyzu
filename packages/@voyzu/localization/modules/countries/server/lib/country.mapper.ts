import type {
  CountryCreateRequestDto,
  CountryPatchRequestDto,
  CountryResponseDto,
  CountryUpdateRequestDto,
} from "@voyzu/localization/types/modules/countries";

import type { CountryRow, InsertCountryRow, PatchCountryRow, UpdateCountryRow } from "../db/country.row.types";

export function toInsertRow(input: CountryCreateRequestDto): InsertCountryRow {
  return {
    code: input.code,
    name: input.name,
    currency_code: input.currencyCode,
  };
}

export function toUpdateRow(input: CountryUpdateRequestDto): UpdateCountryRow {
  return {
    name: input.name,
    currency_code: input.currencyCode,
  };
}

export function toPatchRow(input: CountryPatchRequestDto): PatchCountryRow {
  const row: PatchCountryRow = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.currencyCode !== undefined) row.currency_code = input.currencyCode;
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
    status: row.status as CountryResponseDto["status"],
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
