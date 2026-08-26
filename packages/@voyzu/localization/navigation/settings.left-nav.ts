import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";

import { pageRoutes as countriesPageRoutes } from "../modules/countries/pages.routes";
import { pageRoutes as currenciesPageRoutes } from "../modules/currencies/pages.routes";

export const localizationSettingsLeftNav = [{
  items: [{
    label: "Localization",
    icon: "globe",
    path: "#localization",
    children: [
      { label: "Countries", routeId: countriesPageRoutes.list.id },
      { label: "Currencies", routeId: currenciesPageRoutes.list.id },
    ],
  }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default localizationSettingsLeftNav;
