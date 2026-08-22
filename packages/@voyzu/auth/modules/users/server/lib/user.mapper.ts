import type { UserResponseDto } from "@voyzu/auth/types";
import type { UserRow } from "../db/user.row.types";

interface UserAuditActors {
  creationUser?: UserResponseDto["audit"]["created"]["user"];
  updatedUser?: UserResponseDto["audit"]["updated"]["user"];
}

export function toDto(
  row: UserRow,
  auditActors: UserAuditActors = {},
): UserResponseDto {
  const dto: UserResponseDto = {
    id: row.id,
    code: row.code,
    email: row.email,
    displayName: row.display_name,
    role: row.role as UserResponseDto["role"],
    accessMode: row.access_mode as UserResponseDto["accessMode"],
    implementerAccess: row.implementer_access,
    status: row.status as UserResponseDto["status"],
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
  return dto;
}
