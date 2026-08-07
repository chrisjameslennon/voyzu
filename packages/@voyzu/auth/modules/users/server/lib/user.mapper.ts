import type { UserCompanyAssignmentDto, UserResponseDto } from "@voyzu/auth/types";
import { checkResponse } from "@voyzu/capability/validation";
import type { UserAssignmentRow, UserRow } from "../db/user.row.types";
import { validateResponse } from "./user.validator";

interface UserAuditActors {
  creationUser?: UserResponseDto["audit"]["created"]["user"];
  updatedUser?: UserResponseDto["audit"]["updated"]["user"];
}

export function toAssignmentDto(row: UserAssignmentRow): UserCompanyAssignmentDto {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    companyCode: row.company_code,
    companyName: row.company_name,
  };
}

export function toDto(
  row: UserRow,
  assignments: UserAssignmentRow[] = [],
  auditActors: UserAuditActors = {},
): UserResponseDto {
  const dto: UserResponseDto = {
    id: row.id,
    code: row.code,
    email: row.email,
    displayName: row.display_name,
    role: row.role as UserResponseDto["role"],
    accessMode: row.access_mode as UserResponseDto["accessMode"],
    showDeveloperLinks: row.show_developer_links,
    status: row.status as UserResponseDto["status"],
    assignments: assignments.map(toAssignmentDto),
    audit: {
      created: {
        date: row.creation_date,
        actorType: row.creation_actor_type,
        userId: row.creation_user_id,
        user: auditActors.creationUser,
        mutationId: row.creation_mutation_id,
      },
      updated: {
        date: row.updated_date,
        actorType: row.updated_actor_type,
        userId: row.updated_user_id,
        user: auditActors.updatedUser,
        mutationId: row.updated_mutation_id,
      },
    },
  };
  return checkResponse(dto, validateResponse(dto), `user (id=${dto.id})`);
}
