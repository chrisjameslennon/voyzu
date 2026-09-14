import settingsMenu from "./ui-surface/settings.left-nav";

import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as systemInfoPageRoutes } from "./modules/system-info/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";


export const systemInfoPackage = {
  contracts: {
    uiSurface: {
      "leftnav.menu": {
        "/settings": { content: settingsMenu },
      },
    },
    pageRouting: {
      roots: {
        "/settings/system-information": {
          routes: mergePageRoutes(
            systemInfoPageRoutes,
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

export default systemInfoPackage;
