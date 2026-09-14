import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as uiReferencePageRoutes } from "./modules/ui-reference/pages.routes";
import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { uiReferenceModule } from "./modules/ui-reference/module";

export const uiReferencePackage = {
  contracts: {
    pageRouting: {
      roots: ["/ui-reference"],
      routes: mergePageRoutes(
        uiReferencePageRoutes,
      ),
    }, httpApiRouting, httpApiDocumentation },
  modules: [uiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default uiReferencePackage;
