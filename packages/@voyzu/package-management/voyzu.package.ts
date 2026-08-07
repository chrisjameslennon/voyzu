import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { packageManagementModule } from "./modules/package-management/module";
import { reconcileInstalledPackages } from "./modules/package-management/server/lib/installed-package.service";

export const voyzuPackageManagementPackage = {
  modules: [packageManagementModule],
  install: {
    sql: ["./install/db/sql/installed-packages.sql"],
  },
  scripts: {
    refresh: async () => {
      await reconcileInstalledPackages();
    },
  },
} as const satisfies VoyzuPackageDefinition;

export default voyzuPackageManagementPackage;
