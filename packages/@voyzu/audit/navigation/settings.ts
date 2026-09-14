import type { VoyzuPackageNavigationGroup } from "@voyzu/types/framework";

export const auditSettingsLeftNav = [{
  items: [{ label: "Audit Log", icon: "history", routeId: "voyzu.audit.page.list" }],
}] as const satisfies readonly VoyzuPackageNavigationGroup[];

export default auditSettingsLeftNav;
