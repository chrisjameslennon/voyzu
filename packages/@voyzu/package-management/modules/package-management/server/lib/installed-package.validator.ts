import type { InstalledPackageResponseDto } from "../../../types";
import { validateFields, type FieldValidator } from "@voyzu/capability/validation";

function createResponseValidator() {
  return {
    id: (value) => Number.isInteger(value) && value > 0 ? null : "id must be a positive integer",
    code: (value) => value?.trim() ? null : "code is required",
    description: (value) => typeof value === "string" ? null : "description must be text",
    repository: (value) => typeof value === "string" ? null : "repository must be text",
    status: (value) => value === "ACTIVE" || value === "INACTIVE" ? null : "status is invalid",
    navOrder: (value) => Number.isInteger(value) && value >= 0 ? null : "navOrder must be a non-negative integer",
    preinstalled: (value) => typeof value === "boolean" ? null : "preinstalled must be a boolean",
    hasTopNavigation: (value) => typeof value === "boolean" ? null : "hasTopNavigation must be a boolean",
    required: (value) => typeof value === "boolean" ? null : "required must be a boolean",
    rootPaths: (value) => Array.isArray(value) && value.every((path) => typeof path === "string" && path.startsWith("/")) ? null : "rootPaths are invalid",
  } satisfies {
    [K in keyof InstalledPackageResponseDto]-?: FieldValidator<InstalledPackageResponseDto[K]>;
  };
}

export function validateResponse(input: InstalledPackageResponseDto): string[] {
  return validateFields(input, createResponseValidator());
}
