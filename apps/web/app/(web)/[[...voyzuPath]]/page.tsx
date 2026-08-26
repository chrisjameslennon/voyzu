import { createVoyzuSurfaceRouter } from "@voyzu/ui-surface/server";
import { getCurrentUser } from "@voyzu/auth/users/server";
import { areInstalledPackagePageRoutesVisible, getHomePageRoute } from "@voyzu/package-management/server";

import { AccessDenied } from "../../../src/surface/AccessDenied";
import { authorizeSurfaceRoute } from "../../../src/surface/auth";
import { SurfaceFrame } from "../../../src/surface/SurfaceFrame";
import { voyzuSurfaceConfig } from "../../../src/surface/voyzu.surface.config";

const router = createVoyzuSurfaceRouter({
  config: voyzuSurfaceConfig,
  rootRedirect: () => getHomePageRoute(),
  Frame: SurfaceFrame,
  getCurrentUser,
  authorize: authorizeSurfaceRoute,
  isRouteEnabled: (route) => areInstalledPackagePageRoutesVisible(route.packageName),
  AccessDenied,
});

export const generateMetadata = router.generateMetadata;
export default router.Page;
