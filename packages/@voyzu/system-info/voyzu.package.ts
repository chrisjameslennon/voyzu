import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as systemInfoPageRoutes } from "./modules/system-info/pages.routes";
import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { systemInfoModule } from "./modules/system-info/module";

export const systemInfoPackage = {
  contracts: {
    pageRouting: {
      roots: ["/settings/system-information"],
      routes: mergePageRoutes(
        systemInfoPageRoutes,
      ),
    }, httpApiRouting, httpApiDocumentation },
  modules: [systemInfoModule],
} as const satisfies VoyzuPackageDefinition;

export default systemInfoPackage;
