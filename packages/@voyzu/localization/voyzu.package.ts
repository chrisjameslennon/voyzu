import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";

export const voyzuLocalizationPackage = {
  modules: [countriesModule, currenciesModule],
  install: {
    sql: [
      "./install/db/objects/localization-domains.sql",
      "./install/db/objects/table.currency.create.sql",
      "./install/db/objects/table.country.create.sql",
      "./install/db/objects/audit-triggers.attach.sql"
    ],
    seedSql: [
      "./install/db/seed/currency.seed.sql",
      "./install/db/seed/country.seed.sql"
    ]
  }
} as const satisfies VoyzuPackageDefinition;

export default voyzuLocalizationPackage;
