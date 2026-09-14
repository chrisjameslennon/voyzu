
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as welcomePageRoutes } from "./modules/welcome/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

export const welcomePackage = {
  contracts: {
    uiSurface: {
      "topnav.menu": {
        "welcome": {
          "label": "Welcome",
          "routeId": "voyzu.welcome.page.home"
        }
      },
    },
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
} as const satisfies VoyzuPackageDefinition;

export default welcomePackage;
