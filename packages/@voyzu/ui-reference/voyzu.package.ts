
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as uiReferencePageRoutes } from "./modules/ui-reference/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { uiReferenceModule } from "./modules/ui-reference/module";

export const uiReferencePackage = {
  contracts: {
    pageRouting: {
      roots: {
        "/ui-reference": {
          routes: mergePageRoutes(
            uiReferencePageRoutes,
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
  modules: [uiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default uiReferencePackage;
