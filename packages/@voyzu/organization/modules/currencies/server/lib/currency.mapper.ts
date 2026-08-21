import type { CurrencyCreateRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyUpdateRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyPatchRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyResponseDto } from "@voyzu/organization/types/modules/currencies";

import type { CurrencyRow, InsertCurrencyRow, UpdateCurrencyRow, PatchCurrencyRow } from "../db/currency.row.types";

export function toDto(row: CurrencyRow): CurrencyResponseDto {
  return {
    id: row.code,
    code: row.code,
    name: row.name,
    ...(row.symbol != null && { symbol: row.symbol }),
    status: row.status as CurrencyResponseDto["status"],
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

export function toInsertRow(input: CurrencyCreateRequestDto): InsertCurrencyRow {
  return {
    code: input.code,
    name: input.name,
    ...(input.symbol !== undefined && { symbol: input.symbol }),
  };
}

export function toUpdateRow(input: CurrencyUpdateRequestDto): UpdateCurrencyRow {
  return {
    name: input.name,
    ...(input.symbol !== undefined && { symbol: input.symbol }),
  };
}

export function toPatchRow(input: CurrencyPatchRequestDto): PatchCurrencyRow {
  const row: PatchCurrencyRow = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.symbol !== undefined) row.symbol = input.symbol;
  return row;
}
