import type { Metadata } from "next";

import { createVoyzuPageRenderer } from "@voyzu/ui-surface/server";
import type { VoyzuSurfaceRoute } from "@voyzu/ui-surface/types";
import { getCurrentUser } from "@voyzu/auth/users/server";
import { areInstalledPackagePageRoutesVisible } from "@voyzu/package-management/server";

import { AccessDenied } from "./AccessDenied";
import { authorizeSurfaceRoute } from "./auth";
import { SurfaceFrame } from "./SurfaceFrame";
import { voyzuSurfaceConfig } from "./voyzu.surface.config";

const renderer = createVoyzuPageRenderer({
  config: voyzuSurfaceConfig,
  Frame: SurfaceFrame,
  getCurrentUser,
  authorize: authorizeSurfaceRoute,
  isRouteEnabled: (route) => areInstalledPackagePageRoutesVisible(route.packageName),
  AccessDenied,
});

export function createPageRoute(
  route: object,
  metadata: Pick<VoyzuSurfaceRoute, "packageName" | "helpBaseUrl" | "apiDocsUrl">,
): VoyzuSurfaceRoute {
  const source = route as VoyzuSurfaceRoute;
  return {
    ...source,
    ...metadata,
    breadcrumbBase: source.breadcrumbBase ? [...source.breadcrumbBase] : undefined,
    apiDocsUrl: source.apiDocsUrl ?? metadata.apiDocsUrl,
  };
}

export function generatePageMetadata(route: VoyzuSurfaceRoute): Metadata {
  return renderer.generateMetadata(route);
}

export const renderPage = renderer.Page;
