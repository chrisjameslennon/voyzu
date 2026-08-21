import type { VoyzuPackageModuleDefinition, VoyzuPackageNavigationDomain } from "@voyzu/types/framework";

import { organizationModules } from "../voyzu.package";
import { organizationLeftNav } from "./organization.left-nav";

function routeIds(modules: readonly VoyzuPackageModuleDefinition[]) {
  return modules.flatMap((moduleDefinition) =>
    (Object.values(moduleDefinition.pageRoutes) as { id: string }[]).map(({ id }) => id)
  );
}

const domains = [{
  label: "Organization",
  routeId: organizationModules[0].pageRoutes.detail.id,
  routeIds: routeIds(organizationModules),
  leftNav: organizationLeftNav,
}] as const satisfies readonly VoyzuPackageNavigationDomain[];

export default domains;
