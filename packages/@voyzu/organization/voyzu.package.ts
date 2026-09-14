import leftMenu from "./ui-surface/left-nav";
import { httpApiRoutes as routes0 } from "./modules/organization-access/http-api.routes";
import { httpApiRoutes as routes1 } from "./modules/organization-switcher/http-api.routes";
import { httpApiRoutes as routes2 } from "./modules/organizations/http-api.routes";
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as organizationReportsPageRoutes } from "./modules/organization-reports/pages.routes";
import { pageRoutes as organizationsPageRoutes } from "./modules/organizations/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { organizationsModule } from "./modules/organizations/module";
import { documentLinksModule } from "./modules/document-links/module";
import { organizationSwitcherModule } from "./modules/organization-switcher/module";
import { organizationAccessModule } from "./modules/organization-access/module";
import { organizationReportsModule } from "./modules/organization-reports/module";
import { sampleData } from "./scripts/sample-data";

export const organizationModules = [
  organizationsModule,
  organizationAccessModule,
  organizationReportsModule,
] as const;

export const organizationPackage = {
  contracts: {
    uiSurface: {
      "topnav.menu": {
        "organization.organizations": {
          "label": "Organizations",
          "routeId": "voyzu.organizations.page.list"
        }
      },
      "leftnav.menu": {
        "/organization": { content: leftMenu },
      },
    },
    pageRouting: {
      roots: {
        "/organization": {
          routes: mergePageRoutes(
            organizationReportsPageRoutes,
            organizationsPageRoutes,
          ),
        },
      },
    },
    httpApiRouting: {
      roots: ["/organization","/organization-selection"],
      routes: { ...routes0, ...routes1, ...routes2 },
    },
    httpApiDocumentation: {
      "sections": {
        "organization.platform": {
          "title": "Platform",
          "navigationHeadingId": "voyzu.platform",
          "description": "Core Voyzu platform operations.",
          "groups": {
            "organization.operations": {
              "title": "@voyzu/organization",
              "description": "Platform operations provided by @voyzu/organization.",
              "routes": [
                "organization.organization-access.list",
                "organization.organization-access.replace",
                "organization.organization-switcher.getSelection",
                "organization.organization-switcher.setSelection",
                "organization.organization-switcher.accessArchivedSelection",
                "organization.organizations.updateFinance",
                "organization.organizations.list",
                "organization.organizations.create",
                "organization.organizations.filter",
                "organization.organizations.search",
                "organization.organizations.batchCreate",
                "organization.organizations.batchGet",
                "organization.organizations.batchUpdate",
                "organization.organizations.batchPatch",
                "organization.organizations.batchDelete",
                "organization.organizations.batchActivate",
                "organization.organizations.batchDeactivate",
                "organization.organizations.activate",
                "organization.organizations.deactivate",
                "organization.organizations.get",
                "organization.organizations.update",
                "organization.organizations.patch",
                "organization.organizations.delete"
              ]
            }
          }
        }
      }
    },
    internalApi: {
      implements: { ...organizationsModule.implements, ...organizationAccessModule.implements, ...organizationSwitcherModule.implements, ...documentLinksModule.implements },
      },

  },
  modules: [
    documentLinksModule,
    organizationsModule,
    organizationAccessModule,
    organizationReportsModule,
    organizationSwitcherModule,
  ],
  install: {
    sql: [
      "./install/db/objects/table.organization.create.sql",
      "./install/db/objects/table.organization-user-access.create.sql",
      "./install/db/objects/table.document-link.create.sql",
      "./install/db/objects/audit-triggers.attach.sql"
    ],
    seedSql: [
      "./install/db/seed/home-page.seed.sql"
    ]
  },
  scripts: {
    sampleData,
  },
} as const satisfies VoyzuPackageDefinition;

export default organizationPackage;
