import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto } from "@voyzu/types/modules/core";
import { NonBlankString, PositiveId, UserCode, UserDisplayName, UserEmail } from "./user.fields";

export const UserRole = Type.Union([Type.Literal("ADMIN"), Type.Literal("ORGANIZATION_USER"), Type.Literal("COMPANY_USER")]);
export type UserRole = Type.Static<typeof UserRole>;
export const UserAccessMode = Type.Union([Type.Literal("UI"), Type.Literal("API"), Type.Literal("UI_AND_API")]);
export type UserAccessMode = Type.Static<typeof UserAccessMode>;
export const UserStatus = Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]);
export type UserStatus = Type.Static<typeof UserStatus>;

export const UserCompanyAssignmentDto = StrictObject({
  id: PositiveId,
  userId: PositiveId,
  companyId: PositiveId,
  companyCode: NonBlankString,
  companyName: NonBlankString,
});
export type UserCompanyAssignmentDto = Type.Static<typeof UserCompanyAssignmentDto>;

export const UserResponseDto = StrictObject({
  id: PositiveId,
  code: UserCode,
  email: UserEmail,
  displayName: UserDisplayName,
  role: UserRole, accessMode: UserAccessMode,
  showDeveloperLinks: Type.Boolean(), status: UserStatus,
  assignments: Type.Array(UserCompanyAssignmentDto),
  audit: AuditMetadataDto,
});
export type UserResponseDto = Type.Static<typeof UserResponseDto>;
