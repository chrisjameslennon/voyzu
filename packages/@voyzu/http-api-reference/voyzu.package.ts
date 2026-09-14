
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as httpApiReferencePageRoutes } from "./modules/http-api-reference/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { httpApiReferenceModule } from "./modules/http-api-reference/module";

export const httpApiReferencePackage = {
  contracts: {
    pageRouting: {
      roots: {
        "/http-api-reference": {
          routes: mergePageRoutes(
            httpApiReferencePageRoutes,
          ),
        },
      },
    },
    httpApiRouting: {
      roots: [],
      routes: {  },
    },
    httpApiDocumentation: {
      "sections": {}
    },
  },
  modules: [httpApiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default httpApiReferencePackage;
