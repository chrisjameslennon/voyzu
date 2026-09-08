import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto } from "@voyzu/types/modules/core";
import { UserRole, UserAccessMode, UserStatus } from "@voyzu/types/identity";

/** Full existing public user DTO. Credentials are never part of master data. */
export const UserMasterData = StrictObject({
  id: Type.Integer({ minimum: 1 }),
  code: Type.String({ minLength: 1, maxLength: 20, pattern: "^[A-Z0-9_-]+$" }),
  email: Type.Union([Type.String({ pattern: "^\\S(?:.*\\S)?$" }), Type.Null()]),
  displayName: Type.String({ maxLength: 50, pattern: "\\S" }),
  role: UserRole,
  accessMode: UserAccessMode,
  implementerAccess: Type.Boolean(),
  status: UserStatus,
  audit: AuditMetadataDto,
});
