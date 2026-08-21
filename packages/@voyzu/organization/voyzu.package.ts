import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { organizationModule } from "./modules/organization/module";
import { companiesModule } from "./modules/companies/module";
import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";
import { companySwitcherModule } from "./modules/company-switcher/module";
import { organizationReportsModule } from "./modules/organization-reports/module";

export const organizationModules = [
  organizationModule,
  companiesModule,
  countriesModule,
  currenciesModule,
  organizationReportsModule,
] as const;

export const voyzuOrganizationPackage = {
  modules: [
    organizationModule,
    companiesModule,
    countriesModule,
    currenciesModule,
    organizationReportsModule,
    companySwitcherModule,
  ],
  install: {
    sql: [
      "./install/db/objects/accounting-domains.sql",
      "./install/db/objects/table.organization.create.sql",
      "./install/db/objects/table.currency.create.sql",
      "./install/db/objects/table.country.create.sql",
      "./install/db/objects/table.company.create.sql",
      "./install/db/objects/table.app-user-assignment.create.sql",
      "./install/db/objects/audit-company-reference.attach.sql",
      "./install/db/objects/audit-triggers.attach.sql"
    ],
    seedSql: [
      "./install/db/seed/organization.seed.sql",
      "./install/db/seed/currency.seed.sql",
      "./install/db/seed/country.seed.sql",
      "./install/db/seed/company.seed.sql",
      "./install/db/seed/home-page.seed.sql"
    ]
  }
} as const satisfies VoyzuPackageDefinition;

export default voyzuOrganizationPackage;
