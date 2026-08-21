import type { OperationBlocker } from "@voyzu/types/modules/core";

const REQUIRED_PACKAGE_NAMES = new Set([
  "@voyzu/audit",
  "@voyzu/auth",
  "@voyzu/foundation",
  "@voyzu/organization",
  "@voyzu/package-management",
]);

export interface InstalledPackageOperationState {
  code: string;
}

export function isRequiredPackage(code: string): boolean {
  return REQUIRED_PACKAGE_NAMES.has(code);
}

export function ChangePageRouteVisibility(
  current: InstalledPackageOperationState,
  pageRoutesVisible: boolean,
): OperationBlocker[] {
  if (!pageRoutesVisible && isRequiredPackage(current.code)) {
    return [{
      code: "REQUIRED_PACKAGE",
      message: `${current.code} is required by the Voyzu platform and its page routes cannot be hidden`,
    }];
  }

  return [];
}
