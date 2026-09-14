import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";
import { CountryDefinition } from "./contracts/country.definition";
import { CurrencyDefinition } from "./contracts/currency.definition";

export const voyzuLocalizationPackage = {
  contracts: {
    httpApiRouting,
    httpApiDocumentation,
    internalApi: {
      implements: { ...countriesModule.implements, ...currenciesModule.implements },
      defines: {
        "@core/country": CountryDefinition,
        "@core/currency": CurrencyDefinition,
      },
    },
    
  },
  modules: [countriesModule, currenciesModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuLocalizationPackage;
