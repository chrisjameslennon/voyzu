import leftMenu from "./ui-surface/left-nav";

import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as uiReferencePageRoutes } from "./modules/ui-reference/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { uiReferenceModule } from "./modules/ui-reference/module";

export const uiReferencePackage = {
  contracts: {
    uiSurface: {
      "topnav.menu": {
        "ui-reference": {
          "label": "UI Reference",
          "routeId": "voyzu.ui-reference.page.alert"
        }
      },
      "leftnav.menu": {
        "/ui-reference": { content: leftMenu },
      },
    },
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
