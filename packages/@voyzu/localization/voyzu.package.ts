import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";

export const voyzuLocalizationPackage = {
  contracts: {
    semanticDataDefinition: {
      implements: {
        "currency": {
          get: (code: string) => import("./modules/currencies/server/lib/currency.service").then((module) => module.getCurrency(code)),
          queries: { all: (_input: Record<string, never>) => import("./modules/currencies/server/lib/currency.service").then((module) => module.listCurrencies()) },
        },
        "country": {
          get: (code: string) => import("./modules/countries/server/lib/country.service").then((module) => module.getCountry(code)),
          queries: { all: (_input: Record<string, never>) => import("./modules/countries/server/lib/country.service").then((module) => module.listCountries()) },
        },
      },
    },
  },
  modules: [countriesModule, currenciesModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuLocalizationPackage;
