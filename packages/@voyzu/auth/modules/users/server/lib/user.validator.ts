import type { UserAccessMode } from "@voyzu/auth/types";
import type { UserCreateRequestDto } from "@voyzu/auth/types";
import type { UserPasswordUpdateRequestDto } from "@voyzu/auth/types";
import type { UserUpdateRequestDto } from "@voyzu/auth/types";
import type { UserResponseDto } from "@voyzu/auth/types";

const ROLES = new Set(["ADMIN", "ORGANIZATION_USER", "COMPANY_USER"]);
const ACCESS_MODES = new Set(["UI", "API", "UI_AND_API"]);
const STATUSES = new Set(["ACTIVE", "INACTIVE"]);
const CODE_RE = /^[A-Z0-9_-]+$/;

type FieldValidator<T> = (value: T) => string | null;

function validateFields<T extends object>(input: T, validators: { [K in keyof T]-?: FieldValidator<T[K]> }): string[] {
  return (Object.keys(validators) as Array<keyof T>)
    .map((key) => validators[key](input[key]))
    .filter((error): error is string => error !== null);
}

function validateCode(value: string): string | null {
  const code = value?.trim() ?? "";
  if (!code) return "code is required";
  if (code.length > 20) return "code must be 20 characters or fewer";
  return CODE_RE.test(code) ? null : "code must use capital letters, numbers, dash, and underscore only";
}

function validateDisplayName(value: string): string | null {
  if (!value?.trim()) return "displayName is required";
  return value.trim().length <= 50 ? null : "displayName must be 50 characters or fewer";
}

function validateEmail(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (value.trim() === "") return "email must be null or non-blank";
  return value === value.trim() ? null : "email must not have leading or trailing spaces";
}

function validateCompanyIds(value: number[] | undefined): string | null {
  return value?.some((id) => !Number.isInteger(id) || id <= 0) ? "companyIds must be positive integers" : null;
}

function createUserCreateValidator(accessMode: UserAccessMode | string | undefined) {
  const minimumLength = getMinimumPasswordLength(accessMode);
  return {
    code: validateCode,
    email: validateEmail,
    displayName: validateDisplayName,
    password: (value) => {
      if (!value) return "password is required";
      return value.length >= minimumLength ? null : `password must be at least ${minimumLength} characters`;
    },
    confirmPassword: (value) => value ? null : "confirmPassword is required",
    role: (value) => ROLES.has(value) ? null : "role is invalid",
    accessMode: (value) => ACCESS_MODES.has(value) ? null : "accessMode is invalid",
    showDeveloperLinks: (value) => value === undefined || typeof value === "boolean" ? null : "showDeveloperLinks must be a boolean",
    status: (value) => value === undefined || STATUSES.has(value) ? null : "status is invalid",
    companyIds: validateCompanyIds,
  } satisfies {
    [K in keyof UserCreateRequestDto]-?: FieldValidator<UserCreateRequestDto[K]>;
  };
}

function createUserUpdateValidator() {
  return {
    code: validateCode,
    email: validateEmail,
    displayName: validateDisplayName,
    role: (value) => ROLES.has(value) ? null : "role is invalid",
    accessMode: (value) => ACCESS_MODES.has(value) ? null : "accessMode is invalid",
    showDeveloperLinks: (value) => value === undefined || typeof value === "boolean" ? null : "showDeveloperLinks must be a boolean",
    status: (value) => STATUSES.has(value) ? null : "status is invalid",
    companyIds: validateCompanyIds,
  } satisfies {
    [K in keyof UserUpdateRequestDto]-?: FieldValidator<UserUpdateRequestDto[K]>;
  };
}

export function validateUserInput(input: UserCreateRequestDto | UserUpdateRequestDto): string[] {
  const errors = "password" in input
    ? validateFields(input, createUserCreateValidator(input.accessMode))
    : validateFields(input, createUserUpdateValidator());

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

function createPasswordUpdateValidator(accessMode: UserAccessMode | string | undefined) {
  const minimumLength = getMinimumPasswordLength(accessMode);
  return {
    password: (value) => {
      if (!value) return "password is required";
      return value.length >= minimumLength ? null : `password must be at least ${minimumLength} characters`;
    },
    confirmPassword: (value) => value ? null : "confirmPassword is required",
  } satisfies {
    [K in keyof UserPasswordUpdateRequestDto]-?: FieldValidator<UserPasswordUpdateRequestDto[K]>;
  };
}

export function validateUserPassword(
  input: UserCreateRequestDto | UserPasswordUpdateRequestDto,
  accessMode?: UserAccessMode | string,
): string[] {
  const passwordInput: UserPasswordUpdateRequestDto = {
    password: input.password,
    confirmPassword: input.confirmPassword,
  };
  const errors = validateFields(passwordInput, createPasswordUpdateValidator(accessMode));
  if (input.password && input.confirmPassword && input.password !== input.confirmPassword) {
    errors.push("password and confirmPassword must match");
  }
  return errors;
}

function createResponseValidator() {
  return {
    id: (value) => Number.isInteger(value) && value > 0 ? null : "id must be a positive integer",
    code: validateCode,
    email: validateEmail,
    displayName: validateDisplayName,
    role: (value) => ROLES.has(value) ? null : "role is invalid",
    accessMode: (value) => ACCESS_MODES.has(value) ? null : "accessMode is invalid",
    showDeveloperLinks: (value) => typeof value === "boolean" ? null : "showDeveloperLinks must be a boolean",
    status: (value) => STATUSES.has(value) ? null : "status is invalid",
    assignments: (value) => Array.isArray(value) && value.every((assignment) =>
      Number.isInteger(assignment.id) && assignment.id > 0 &&
      Number.isInteger(assignment.userId) && assignment.userId > 0 &&
      Number.isInteger(assignment.companyId) && assignment.companyId > 0 &&
      Boolean(assignment.companyCode?.trim()) && Boolean(assignment.companyName?.trim())
    ) ? null : "assignments are invalid",
    audit: (value) => value?.created?.date && value?.updated?.date ? null : "audit timestamps are required",
  } satisfies {
    [K in keyof UserResponseDto]-?: FieldValidator<UserResponseDto[K]>;
  };
}

export function validateResponse(input: UserResponseDto): string[] {
  return validateFields(input, createResponseValidator());
}
