import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as organizationReportsPageRoutes } from "./modules/organization-reports/pages.routes";
import { pageRoutes as organizationsPageRoutes } from "./modules/organizations/pages.routes";
import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
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
    pageRouting: {
      roots: ["/organization"],
      routes: mergePageRoutes(
        organizationReportsPageRoutes,
        organizationsPageRoutes,
      ),
    },
    httpApiRouting,
    httpApiDocumentation,
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
