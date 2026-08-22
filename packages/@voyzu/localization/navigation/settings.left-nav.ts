import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";

import { countriesModule } from "../modules/countries/module";
import { currenciesModule } from "../modules/currencies/module";

export const localizationSettingsLeftNav = [{
  items: [{
    label: "Localization",
    icon: "globe",
    path: "#localization",
    children: [
      { label: "Countries", routeId: countriesModule.pageRoutes.list.id },
      { label: "Currencies", routeId: currenciesModule.pageRoutes.list.id },
    ],
  }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default localizationSettingsLeftNav;
