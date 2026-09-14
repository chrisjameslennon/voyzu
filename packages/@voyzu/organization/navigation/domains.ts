import type { VoyzuPackageNavigationDomain } from "@voyzu/types/framework";

import { pageRoutes as organizationPageRoutes } from "../modules/organizations/pages.routes";
import { pageRoutes as organizationReportPageRoutes } from "../modules/organization-reports/pages.routes";
import { organizationLeftNav } from "./organization.left-nav";

const routeIds = [
  ...Object.keys(organizationPageRoutes),
  ...Object.keys(organizationReportPageRoutes),
];

const domains = [{
  label: "Organizations",
  routeId: "voyzu.organizations.page.list",
  routeIds,
  leftNav: organizationLeftNav,
}] as const satisfies readonly VoyzuPackageNavigationDomain[];

export default domains;
