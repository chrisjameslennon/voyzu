import leftMenu from "./ui-surface/left-nav";

import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as httpApiReferencePageRoutes } from "./modules/http-api-reference/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { httpApiReferenceModule } from "./modules/http-api-reference/module";

export const httpApiReferencePackage = {
  contracts: {
    uiSurface: {
      "topnav.menu": {
        "http-api-reference": {
          "label": "HTTP API Reference",
          "routeId": "voyzu.http-api-reference.page.getting-started"
        }
      },
      "leftnav.menu": {
        "/http-api-reference": { content: leftMenu },
      },
    },
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
