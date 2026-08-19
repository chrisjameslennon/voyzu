import type {
  UserAccessMode,
  UserCreateRequestDto,
  UserPasswordUpdateRequestDto,
  UserUpdateRequestDto,
} from "@voyzu/auth/types";

export function validateUserInput(input: UserCreateRequestDto | UserUpdateRequestDto): string[] {
  const errors: string[] = [];
  if (input.showDeveloperLinks === true && input.role !== "ADMIN") {
    errors.push("showDeveloperLinks can only be enabled for admin users");
  }
  if (input.role !== "COMPANY_USER" && input.companyIds?.length) {
    errors.push("company assignments are only valid for company users");
  }
  return errors;
}

export function getMinimumPasswordLength(accessMode: UserAccessMode | string | undefined): number {
  return accessMode === "API" || accessMode === "UI_AND_API" ? 16 : 8;
}

export function validateUserPassword(
  input: UserCreateRequestDto | UserPasswordUpdateRequestDto,
  accessMode?: UserAccessMode | string,
): string[] {
  const errors: string[] = [];
  const minimumLength = getMinimumPasswordLength(accessMode);
  if (input.password.length < minimumLength) {
    errors.push(`password must be at least ${minimumLength} characters`);
  }
  if (input.password !== input.confirmPassword) {
    errors.push("password and confirmPassword must match");
  }
  return errors;
}
