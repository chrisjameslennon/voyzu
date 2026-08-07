import type { UserAccessMode, UserRole, UserStatus } from "./user.response.dto";

export interface UserCreateRequestDto {
  code: string;
  email?: string | null;
  displayName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  accessMode: UserAccessMode;
  showDeveloperLinks?: boolean;
  status?: UserStatus;
  companyIds?: number[];
}
