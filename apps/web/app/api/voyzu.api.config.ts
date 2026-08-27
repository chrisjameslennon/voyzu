import type { VoyzuApiConfig } from "@voyzu/api";
import { capabilityModule } from "@voyzu/api/capability-module";

import { preinstalledApiRoutes } from "../../.generated/api-routes";
import { installedApiRoutes } from "../../.generated/api-routes/installed";

export const voyzuApiConfig = {
  basePath: "/api",
  routes: [
    ...preinstalledApiRoutes,
    ...installedApiRoutes,
    ...Object.values(capabilityModule.apiDefinitions),
  ],
} satisfies VoyzuApiConfig;
