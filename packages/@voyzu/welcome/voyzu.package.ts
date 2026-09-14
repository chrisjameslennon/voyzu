
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as welcomePageRoutes } from "./modules/welcome/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { welcomeModule } from "./modules/welcome/module";

export const welcomePackage = {
  contracts: {
    pageRouting: {
      roots: {
        "/welcome": {
          routes: mergePageRoutes(
            welcomePageRoutes,
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
  modules: [welcomeModule],
} as const satisfies VoyzuPackageDefinition;

export default welcomePackage;
