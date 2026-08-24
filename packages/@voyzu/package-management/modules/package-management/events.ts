import Type from "typebox";

import { InstalledPackageResponseDto } from "@voyzu/package-management/types";

export const events = {
  installedPackagesReconciled: {
    description: "The installed package inventory was reconciled.",
    payload: Type.Array(InstalledPackageResponseDto),
  },
  installedPackageVisibilityUpdated: {
    description: "An installed package's visibility was updated.",
    payload: InstalledPackageResponseDto,
  },
  homePageRouteUpdated: {
    description: "The application home page route was updated.",
    payload: Type.String(),
  },
  installedPackagesReordered: {
    description: "Installed packages were reordered.",
    payload: Type.Array(InstalledPackageResponseDto),
  },
} as const;
