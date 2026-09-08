import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";

export const voyzuLocalizationPackage = {
  contracts: {
    implements: {
      masterData: {
        "platform.currency": {
          get: (code: string) => import("./modules/currencies/server/lib/currency.service").then((module) => module.getCurrency(code)),
          list: () => import("./modules/currencies/server/lib/currency.service").then((module) => module.listCurrencies()),
        },
        "platform.country": {
          get: (code: string) => import("./modules/countries/server/lib/country.service").then((module) => module.getCountry(code)),
          list: () => import("./modules/countries/server/lib/country.service").then((module) => module.listCountries()),
        },
      },
    },
  },
  modules: [countriesModule, currenciesModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuLocalizationPackage;
