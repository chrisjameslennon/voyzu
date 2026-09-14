import type { PartyCreateRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyUpdateRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyPatchRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyResponseDto } from "@voyzu/party/types/modules/parties";

import type { PartyRow, InsertPartyRow, UpdatePartyRow, PatchPartyRow } from "../db/party.row.types";

export function toDto(row: PartyRow): PartyResponseDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status as PartyResponseDto["status"],
    audit: {
      created: {
        date: new Date(row.creation_date).toISOString(),
        actorType: row.creation_actor_type,
        userId: row.creation_user_id,
        mutationId: row.creation_mutation_id,
      },
      updated: {
        date: new Date(row.updated_date).toISOString(),
        actorType: row.updated_actor_type,
        userId: row.updated_user_id,
        mutationId: row.updated_mutation_id,
      },
    },
  };
}

export function toInsertRow(input: PartyCreateRequestDto): InsertPartyRow {
  return {
    code: input.code,
    name: input.name,
  };
}

export function toUpdateRow(input: PartyUpdateRequestDto): UpdatePartyRow {
  return {
    name: input.name,
  };
}

export function toPatchRow(input: PartyPatchRequestDto): PatchPartyRow {
  const row: PatchPartyRow = {};
  if (input.name !== undefined) row.name = input.name;
  return row;
}
