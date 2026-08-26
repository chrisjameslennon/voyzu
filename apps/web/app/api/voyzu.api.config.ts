import type { VoyzuApiConfig } from "@voyzu/api";
import { capabilityModule } from "@voyzu/api/capability-module";

import { preinstalledApiRoutes } from "../../.generated/api-routes";
import { installedPackageApiModules } from "../../.generated/navigation/packages";

export const voyzuApiConfig = {
  basePath: "/api",
  routes: [
    ...preinstalledApiRoutes,
    ...Object.values(capabilityModule.apiDefinitions),
  ],
  modules: installedPackageApiModules,
} satisfies VoyzuApiConfig;
