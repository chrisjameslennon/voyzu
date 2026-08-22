import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto } from "@voyzu/types/modules/core";
import { PositiveId, UserCode, UserDisplayName, UserEmail } from "./user.fields";

export const UserRole = Type.Union([Type.Literal("ADMIN"), Type.Literal("STANDARD")]);
export type UserRole = Type.Static<typeof UserRole>;
export const UserAccessMode = Type.Union([Type.Literal("UI"), Type.Literal("API"), Type.Literal("UI_AND_API")]);
export type UserAccessMode = Type.Static<typeof UserAccessMode>;
export const UserStatus = Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]);
export type UserStatus = Type.Static<typeof UserStatus>;

export const UserResponseDto = StrictObject({
  id: PositiveId,
  code: UserCode,
  email: UserEmail,
  displayName: UserDisplayName,
  role: UserRole, accessMode: UserAccessMode,
  implementerAccess: Type.Boolean(), status: UserStatus,
  audit: AuditMetadataDto,
});
export type UserResponseDto = Type.Static<typeof UserResponseDto>;
