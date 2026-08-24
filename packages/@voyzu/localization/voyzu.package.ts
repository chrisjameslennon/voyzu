import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";

export const voyzuLocalizationPackage = {
  modules: [countriesModule, currenciesModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuLocalizationPackage;
