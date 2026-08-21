import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";
import { auditModule } from "../modules/audit/module";

export const auditSettingsLeftNav = [{
  items: [{ label: "Audit Log", icon: "history", routeId: auditModule.pageRoutes.list.id }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default auditSettingsLeftNav;
