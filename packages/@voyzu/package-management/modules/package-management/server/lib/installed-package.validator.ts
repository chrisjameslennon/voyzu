import type { InstalledPackageResponseDto } from "../../../types";
import { validateFields, type FieldValidator } from "@voyzu/capability/validation";

function createResponseValidator() {
  return {
    id: (value) => Number.isInteger(value) && value > 0 ? null : "id must be a positive integer",
    code: (value) => value?.trim() ? null : "code is required",
    description: (value) => typeof value === "string" ? null : "description must be text",
    repository: (value) => typeof value === "string" ? null : "repository must be text",
    topNavigationVisible: (value) => typeof value === "boolean" ? null : "topNavigationVisible must be a boolean",
    pageRoutesVisible: (value) => typeof value === "boolean" ? null : "pageRoutesVisible must be a boolean",
    navOrder: (value) => Number.isInteger(value) && value >= 0 ? null : "navOrder must be a non-negative integer",
    preinstalled: (value) => typeof value === "boolean" ? null : "preinstalled must be a boolean",
    hasTopNavigation: (value) => typeof value === "boolean" ? null : "hasTopNavigation must be a boolean",
    required: (value) => typeof value === "boolean" ? null : "required must be a boolean",
    pageRootPaths: (value) => Array.isArray(value) && value.every((path) => typeof path === "string" && path.startsWith("/")) ? null : "pageRootPaths are invalid",
    apiRootPaths: (value) => Array.isArray(value) && value.every((path) => typeof path === "string" && path.startsWith("/")) ? null : "apiRootPaths are invalid",
  } satisfies {
    [K in keyof InstalledPackageResponseDto]-?: FieldValidator<InstalledPackageResponseDto[K]>;
  };
}

export function validateResponse(input: InstalledPackageResponseDto): string[] {
  return validateFields(input, createResponseValidator());
}
