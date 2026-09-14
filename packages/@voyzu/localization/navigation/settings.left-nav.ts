import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";

export const localizationSettingsLeftNav = [{
  items: [{
    label: "Localization",
    icon: "globe",
    path: "#localization",
    children: [
      { label: "Countries", routeId: "voyzu.countries.page.list" },
      { label: "Currencies", routeId: "voyzu.currencies.page.list" },
    ],
  }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default localizationSettingsLeftNav;
