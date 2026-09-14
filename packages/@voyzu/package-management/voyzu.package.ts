import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { packageManagementModule } from "./modules/package-management/module";
import { reconcileInstalledPackages } from "./modules/package-management/server/lib/installed-package.service";

export const voyzuPackageManagementPackage = {
  contracts: {
    httpApiRouting,
    httpApiDocumentation, internalApi: { defines: packageManagementModule.defines, implements: packageManagementModule.implements } },
  modules: [packageManagementModule],
  install,
  scripts: {
    refresh: async () => {
      await reconcileInstalledPackages();
    },
  },
} as const satisfies VoyzuPackageDefinition;

export default voyzuPackageManagementPackage;
