import type { OperationBlocker } from "@voyzu/types/modules/core";

import type { InstalledPackageStatus } from "../../types";

const REQUIRED_PACKAGE_NAMES = new Set([
  "@voyzu/audit",
  "@voyzu/auth",
  "@voyzu/foundation",
  "@voyzu/package-management",
]);

export interface InstalledPackageOperationState {
  code: string;
  status: InstalledPackageStatus;
}

export function isRequiredPackage(code: string): boolean {
  return REQUIRED_PACKAGE_NAMES.has(code);
}

export function ChangeVisibility(
  current: InstalledPackageOperationState,
  targetStatus: InstalledPackageStatus,
): OperationBlocker[] {
  if (targetStatus === "INACTIVE" && isRequiredPackage(current.code)) {
    return [{
      code: "REQUIRED_PACKAGE",
      message: `${current.code} is required by the Voyzu platform and cannot be deactivated`,
    }];
  }

  return [];
}
