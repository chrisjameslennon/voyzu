import settingsMenu from "./ui-surface/settings.left-nav";
import { httpApiRoutes as routes0 } from "./modules/audit/http-api.routes";
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as auditPageRoutes } from "./modules/audit/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { auditModule } from "./modules/audit/module";
import { commonAuditModule } from "./modules/common/module";
import { AuditDefinition } from "./contracts/audit.definition";

export const voyzuAuditPackage = {
  contracts: {
    uiSurface: {
      "leftnav.menu": {
        "/settings": { content: settingsMenu },
      },
    },
    pageRouting: {
      roots: {
        "/settings/audit": {
          routes: mergePageRoutes(
            auditPageRoutes,
          ),
        },
      },
    },
    httpApiRouting: {
      roots: ["/audit"],
      routes: { ...routes0 },
    },
    httpApiDocumentation: {
      "sections": {
        "audit.platform": {
          "title": "Platform",
          "navigationHeadingId": "voyzu.platform",
          "description": "Core Voyzu platform operations.",
          "groups": {
            "audit.operations": {
              "title": "@voyzu/audit",
              "description": "Platform operations provided by @voyzu/audit.",
              "routes": [
                "audit.audit.list",
                "audit.audit.count",
                "audit.audit.export",
                "audit.audit.get"
              ]
            }
          }
        }
      }
    },
    internalApi: {
      implements: { ...auditModule.implements },
      defines: { "@core/audit": AuditDefinition },
    },
  },
  modules: [auditModule, commonAuditModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuditPackage;
