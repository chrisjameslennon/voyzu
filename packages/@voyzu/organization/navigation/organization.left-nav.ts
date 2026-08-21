import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";
import { companiesModule } from "../modules/companies/module";
import { countriesModule } from "../modules/countries/module";
import { currenciesModule } from "../modules/currencies/module";
import { organizationReportsModule } from "../modules/organization-reports/module";

export const organizationLeftNav = [{
  items: [
    { label: "Organization", icon: "hub", path: "/organization", exactMatch: true },
    { label: "Companies", icon: "domain", routeId: companiesModule.pageRoutes.list.id },
    {
      label: "Localization",
      icon: "globe",
      path: "#localization",
      children: [
        { label: "Countries", routeId: countriesModule.pageRoutes.list.id },
        { label: "Currencies", routeId: currenciesModule.pageRoutes.list.id },
      ],
    },
  ],
}, {
  label: "Reports",
  items: [{
    label: "Lists",
    icon: "format_list_bulleted",
    path: "#organization-reports-lists",
    children: [
      { label: "Companies", routeId: organizationReportsModule.pageRoutes.companies.id },
      { label: "Countries", routeId: organizationReportsModule.pageRoutes.countries.id },
      { label: "Country Tax Settings", routeId: organizationReportsModule.pageRoutes.countryTaxSettings.id },
      { label: "Currencies", routeId: organizationReportsModule.pageRoutes.currencies.id },
    ],
  }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default organizationLeftNav;
