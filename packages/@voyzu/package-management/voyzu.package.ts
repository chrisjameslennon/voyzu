import { httpApiRoutes as routes0 } from "./modules/package-management/http-api.routes";
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as packageManagementPageRoutes } from "./modules/package-management/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { packageManagementModule } from "./modules/package-management/module";
import { reconcileInstalledPackages } from "./modules/package-management/server/lib/installed-package.service";

export const voyzuPackageManagementPackage = {
  contracts: {
    pageRouting: {
      roots: {
        "/settings/packages": {
          routes: mergePageRoutes(
            packageManagementPageRoutes,
          ),
        },
      },
    },
    httpApiRouting: {
      roots: ["/installed-packages","/installed-package-reconciliation","/package-settings"],
      routes: { ...routes0 },
    },
    httpApiDocumentation: {
      "sections": {
        "package-management.platform": {
          "title": "Platform",
          "navigationHeadingId": "voyzu.platform",
          "description": "Core Voyzu platform operations.",
          "groups": {
            "package-management.operations": {
              "title": "@voyzu/package-management",
              "description": "Platform operations provided by @voyzu/package-management.",
              "routes": [
                "package-management.package-management.list",
                "package-management.package-management.get",
                "package-management.package-management.update",
                "package-management.package-management.move",
                "package-management.package-management.refresh",
                "package-management.package-management.getHomePage",
                "package-management.package-management.updateHomePage"
              ]
            }
          }
        }
      }
    }, internalApi: { defines: packageManagementModule.defines, implements: packageManagementModule.implements } },
  modules: [packageManagementModule],
  install,
  scripts: {
    refresh: async () => {
      await reconcileInstalledPackages();
    },
  },
} as const satisfies VoyzuPackageDefinition;

export default voyzuPackageManagementPackage;
