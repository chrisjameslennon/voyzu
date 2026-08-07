import type { UserAccessMode, UserRole, UserStatus } from "./user.response.dto";

export interface UserUpdateRequestDto {
  code: string;
  email?: string | null;
  displayName: string;
  role: UserRole;
  accessMode: UserAccessMode;
  showDeveloperLinks?: boolean;
  status: UserStatus;
  companyIds?: number[];
}
