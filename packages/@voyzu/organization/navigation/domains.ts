import type { VoyzuPackageNavigationDomain } from "@voyzu/types/framework";

import { pageRoutes as organizationPageRoutes } from "../modules/organizations/pages.routes";
import { pageRoutes as organizationAccessPageRoutes } from "../modules/organization-access/pages.routes";
import { pageRoutes as organizationReportPageRoutes } from "../modules/organization-reports/pages.routes";
import { organizationLeftNav } from "./organization.left-nav";

const routeIds = [
  ...Object.values(organizationPageRoutes),
  ...Object.values(organizationAccessPageRoutes),
  ...Object.values(organizationReportPageRoutes),
].map(({ id }) => id);

const domains = [{
  label: "Organizations",
  routeId: organizationPageRoutes.list.id,
  routeIds,
  leftNav: organizationLeftNav,
}] as const satisfies readonly VoyzuPackageNavigationDomain[];

export default domains;
