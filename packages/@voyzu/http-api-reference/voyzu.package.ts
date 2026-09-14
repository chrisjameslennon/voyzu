import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as httpApiReferencePageRoutes } from "./modules/http-api-reference/pages.routes";
import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { httpApiReferenceModule } from "./modules/http-api-reference/module";

export const httpApiReferencePackage = {
  contracts: {
    pageRouting: {
      roots: ["/http-api-reference"],
      routes: mergePageRoutes(
        httpApiReferencePageRoutes,
      ),
    }, httpApiRouting, httpApiDocumentation },
  modules: [httpApiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default httpApiReferencePackage;
