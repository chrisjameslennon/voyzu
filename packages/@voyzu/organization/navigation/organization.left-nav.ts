import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";

export const organizationLeftNav = [{
  items: [
    { label: "Organizations", icon: "domain", routeId: "voyzu.organizations.page.list" },
  ],
}, {
  label: "Reports",
  items: [{
    label: "Lists",
    icon: "format_list_bulleted",
    path: "#organization-reports-lists",
    children: [
      { label: "Organizations", routeId: "voyzu.organizationReports.page.organizations" },
      { label: "Countries", routeId: "voyzu.organizationReports.page.countries" },
      { label: "Currencies", routeId: "voyzu.organizationReports.page.currencies" },
    ],
  }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default organizationLeftNav;
