import type { VoyzuHttpApiConfig } from "@voyzu/http-api";

import { preInstalledHttpApiRoutes } from "../../.generated/http-api-routes/pre-installed";
import { installedHttpApiRoutes } from "../../.generated/http-api-routes/installed";

export const voyzuHttpApiConfig = {
  basePath: "/api",
  routes: [
    ...preInstalledHttpApiRoutes,
    ...installedHttpApiRoutes,
  ],
} satisfies VoyzuHttpApiConfig;
