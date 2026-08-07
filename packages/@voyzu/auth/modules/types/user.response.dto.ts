import type { AuditMetadataDto } from "@voyzu/types/modules/core";

export type UserRole = "ADMIN" | "ORGANIZATION_USER" | "COMPANY_USER";
export type UserAccessMode = "UI" | "API" | "UI_AND_API";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserCompanyAssignmentDto {
  id: number;
  userId: number;
  companyId: number;
  companyCode: string;
  companyName: string;
}

export interface UserResponseDto {
  id: number;
  code: string;
  email: string | null;
  displayName: string;
  role: UserRole;
  accessMode: UserAccessMode;
  showDeveloperLinks: boolean;
  status: UserStatus;
  assignments: UserCompanyAssignmentDto[];
  /** Audit metadata for creation and latest update. */
  audit: AuditMetadataDto;
}
