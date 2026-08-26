import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";
import { pageRoutes as auditPageRoutes } from "../modules/audit/pages.routes";

export const auditSettingsLeftNav = [{
  items: [{ label: "Audit Log", icon: "history", routeId: auditPageRoutes.list.id }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default auditSettingsLeftNav;
