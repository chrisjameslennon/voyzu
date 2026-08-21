import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organization/organization.response.dto";
import type { OrganizationUpdateRequestDto } from "@voyzu/organization/types/modules/organization/organization.update.request.dto";

import type { OrganizationRow, UpdateOrganizationRow } from "../db/organization.row.types";

export function toDto(row: OrganizationRow): OrganizationResponseDto {
  return {
    id: row.id,
    code: row.code,
    organizationName: row.organization_name,
    status: row.status as OrganizationResponseDto["status"],
    hasPostings: row.has_postings,
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

export function toUpdateRow(input: OrganizationUpdateRequestDto): UpdateOrganizationRow {
  return {
    code: input.code,
    organization_name: input.organizationName,
  };
}
