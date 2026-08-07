import { createVoyzuSurfaceRouter } from "@voyzu/ui-surface/server";
import { getCurrentUser } from "@voyzu/auth/users/server";
import { getHomePageRoute, isInstalledPackageActive } from "@voyzu/package-management/server";

import { voyzuSurfaceConfig } from "../voyzu.surface.config";
import { authorizeSurfaceRoute } from "../surface/auth";
import { AccessDenied } from "../surface/AccessDenied";
import { SurfaceFrame } from "../surface/SurfaceFrame";

const router = createVoyzuSurfaceRouter({
  config: voyzuSurfaceConfig,
  rootRedirect: () => getHomePageRoute(),
  Frame: SurfaceFrame,
  getCurrentUser,
  authorize: authorizeSurfaceRoute,
  isRouteEnabled: (route) => isInstalledPackageActive(route.packageName),
  AccessDenied,
});

export const generateMetadata = router.generateMetadata;
export default router.Page;
