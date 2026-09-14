import { createElement } from "react";
import type {
  VoyzuSurfaceConfig,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  RegisteredPageRoute,
} from "@voyzu/ui-surface/types";

import httpApiReferenceGeneratedLeftNav from "../../.generated/http-api-reference/navigation.json";
import { preInstalledSurfaceContributions } from "../../.generated/navigation/pre-installed";
import { installedSurfaceContributions } from "../../.generated/navigation/installed";
import { composeUiSurfaces, selectSettingsMenu } from "@voyzu/ui-surface/contributions";
import { preInstalledPageRoutes } from "../../.generated/page-routes/pre-installed";
import { installedPageRoutes } from "../../.generated/page-routes/installed";
import { PackageTopNav } from "./packages/PackageTopNav";
import { SurfaceLeftNav } from "./SurfaceLeftNav";
import { SessionUserMenu } from "./top-nav/SessionUserMenu";
import { VoyzuBrand } from "./top-nav/VoyzuBrand";

const pageRoutes: RegisteredPageRoute[] = [...preInstalledPageRoutes, ...installedPageRoutes];
const composed = composeUiSurfaces([...preInstalledSurfaceContributions, ...installedSurfaceContributions], pageRoutes);
const packageSurfaceDomains = composed.areas.map(area => area.packageName === "@voyzu/http-api-reference"
  ? { ...area, leftNav: [...area.leftNav, ...httpApiReferenceGeneratedLeftNav] }
  : area);
const settingsLeftNav = selectSettingsMenu(composed.settingsMenus, "/settings");
const settingsMenusByRoot = Object.fromEntries([...new Set(pageRoutes.map(route => route.rootPath))]
  .filter(root => root.startsWith("/settings/"))
  .map(root => [root, selectSettingsMenu(composed.settingsMenus, root)]));

const settingsPageRoutes = pageRoutes.filter(
  ({ path }) => path.startsWith("/settings/"),
);
const settingsRoutePaths = pageRoutes.map(({ id, path, rootPath, packageName }) => ({ id, path, rootPath, packageName }));
const headerRoots = new Set(
  [...preInstalledSurfaceContributions, ...installedSurfaceContributions]
    .flatMap(({ surface }) => Object.keys(surface["leftnav.header"] ?? {})),
);
const leftNavRouteIds = [
  ...settingsPageRoutes.map(({ id }) => id),
  ...packageSurfaceDomains
    .filter(area => area.leftNav.some(group => group.items.length > 0) || headerRoots.has(area.rootPath))
    .flatMap((domain) => domain.routePaths.map(({ id }) => id)),
];

export const voyzuSurfaceConfig = {
  slots: {
    "top.brand": createElement(VoyzuBrand),
    "top.primaryNav": createElement(PackageTopNav, {
      domains: packageSurfaceDomains,
    }),
    "top.user": createElement(SessionUserMenu),
    "left.nav": createElement(SurfaceLeftNav, {
      settingsRoutePaths,
      settingsLeftNav,
      settingsMenusByRoot,
      settingsContributions: composed.settingsMenus,
      packageDomains: packageSurfaceDomains,
    }),
  },
  pageRoutes,
  leftNav: [
    ...packageSurfaceDomains.flatMap((domain) => domain.leftNav),
    ...settingsLeftNav,
  ],
  leftNavRouteIds,
  mainRegistrations: [],
} satisfies VoyzuSurfaceConfig;
