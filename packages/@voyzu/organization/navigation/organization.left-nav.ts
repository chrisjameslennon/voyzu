import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";
import { pageRoutes as organizationPageRoutes } from "../modules/organizations/pages.routes";
import { pageRoutes as organizationAccessPageRoutes } from "../modules/organization-access/pages.routes";
import { pageRoutes as organizationReportPageRoutes } from "../modules/organization-reports/pages.routes";

export const organizationLeftNav = [{
  items: [
    { label: "Organizations", icon: "domain", routeId: organizationPageRoutes.list.id },
    { label: "Organization access", icon: "manage_accounts", routeId: organizationAccessPageRoutes.list.id },
  ],
}, {
  label: "Reports",
  items: [{
    label: "Lists",
    icon: "format_list_bulleted",
    path: "#organization-reports-lists",
    children: [
      { label: "Organizations", routeId: organizationReportPageRoutes.organizations.id },
      { label: "Countries", routeId: organizationReportPageRoutes.countries.id },
      { label: "Currencies", routeId: organizationReportPageRoutes.currencies.id },
    ],
  }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default organizationLeftNav;
