import type { VoyzuPackageNavigationDomain } from "@voyzu/types/framework";
import { organizationLeftNav } from "./organization.left-nav";

const domains = [{
  label: "Organizations",
  rootPath: "/organization",
  routeId: "voyzu.organizations.page.list",
  leftNav: organizationLeftNav,
}] as const satisfies readonly VoyzuPackageNavigationDomain[];

export default domains;
