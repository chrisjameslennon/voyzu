import type { VoyzuApiConfig } from "@voyzu/api";
import { capabilityModule } from "@voyzu/api/capability-module";

import { preInstalledApiRoutes } from "../../.generated/api-routes/pre-installed";
import { installedApiRoutes } from "../../.generated/api-routes/installed";

export const voyzuApiConfig = {
  basePath: "/api",
  routes: [
    ...preInstalledApiRoutes,
    ...installedApiRoutes,
    ...Object.values(capabilityModule.apiDefinitions),
  ],
} satisfies VoyzuApiConfig;
