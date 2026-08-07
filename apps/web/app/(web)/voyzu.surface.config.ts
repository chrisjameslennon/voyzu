import { createElement } from "react";
import type {
  VoyzuBreadcrumbItem,
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceConfig,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRoute,
} from "@voyzu/ui-surface/types";

import { voyzuAuthPackage } from "@voyzu/auth/voyzu-package";
import authPackage from "@voyzu/auth/package.json";
import { settingsLeftNav as authSettingsLeftNav } from "@voyzu/auth/navigation/settings";
import { voyzuAuditPackage } from "@voyzu/audit/voyzu-package";
import auditPackage from "@voyzu/audit/package.json";
import { welcomePackage } from "@voyzu/welcome/voyzu-package";
import welcomePackageJson from "@voyzu/welcome/package.json";
import welcomeTopNav from "@voyzu/welcome/navigation/top-nav";
import { voyzuPackageManagementPackage } from "@voyzu/package-management/voyzu-package";
import packageManagementPackageJson from "@voyzu/package-management/package.json";
import { packageManagementSettingsLeftNav } from "@voyzu/package-management/navigation/settings";
import { systemInfoPackage } from "@voyzu/system-info/voyzu-package";
import systemInfoPackageJson from "@voyzu/system-info/package.json";
import { systemInfoSettingsLeftNav } from "@voyzu/system-info/navigation/settings";
import { uiReferencePackage } from "@voyzu/ui-reference/voyzu-package";
import uiReferencePackageJson from "@voyzu/ui-reference/package.json";
import uiReferenceTopNav from "@voyzu/ui-reference/navigation/top-nav";
import uiReferenceLeftNavDefinition from "@voyzu/ui-reference/navigation/left-nav";
import { apiReferencePackage } from "@voyzu/api-reference/voyzu-package";
import apiReferencePackageJson from "@voyzu/api-reference/package.json";
import apiReferenceTopNav from "@voyzu/api-reference/navigation/top-nav";
import apiReferenceLeftNavDefinition from "@voyzu/api-reference/navigation/left-nav";
import {
  composedLeftNav,
  composedMainRegistrations,
  composedPageRoutes,
  createComposedSurfaceDomains,
} from "../../../../generated-composition/packages.generated";
import { VoyzuBrand } from "./surface/top-nav/VoyzuBrand";
import { SurfaceLeftNav } from "./surface/SurfaceLeftNav";
import { PackageTopNav } from "./surface/packages/PackageTopNav";
import { SessionUserMenu } from "./surface/top-nav/SessionUserMenu";

type PreinstalledRoute = Omit<VoyzuSurfaceRoute, "breadcrumbBase"> & {
  readonly breadcrumbBase?: readonly VoyzuBreadcrumbItem[];
};

type PreinstalledModule = {
  readonly pageRoutes: Readonly<Record<string, PreinstalledRoute>>;
  readonly apiDefinitions: Readonly<Record<string, unknown>>;
};

type PreinstalledPackage = {
  readonly modules: readonly PreinstalledModule[];
};

function apiReferencePath(
  packageName: string,
  route: PreinstalledRoute,
): string | undefined {
  const moduleId = route.id.match(/^voyzu\.(.+)\.page\./)?.[1];
  return moduleId
    ? `/api-reference/${packageName.replace("/", "-")}/${moduleId}`
    : undefined;
}

function mutableRoute(
  route: PreinstalledRoute,
  helpBaseUrl: string,
  packageName: string,
  hasApiDefinitions: boolean,
): VoyzuSurfaceRoute {
  return {
    ...route,
    packageName,
    helpBaseUrl,
    apiDocsUrl: route.apiDocsUrl
      ?? (hasApiDefinitions ? apiReferencePath(packageName, route) : undefined),
    breadcrumbBase: "breadcrumbBase" in route && route.breadcrumbBase
      ? [...route.breadcrumbBase]
      : undefined,
  } as VoyzuSurfaceRoute;
}

function packagePageRoutes(
  definition: PreinstalledPackage,
  rootPaths: readonly string[],
  packageName: string,
  helpBaseUrl: string,
): VoyzuSurfaceRoute[] {
  return definition.modules.flatMap((module) => {
    const hasApiDefinitions = Object.keys(module.apiDefinitions).length > 0;
    return Object.values(module.pageRoutes).map((route) => {
      if (!rootPaths.some((rootPath) => route.path === rootPath || route.path.startsWith(`${rootPath}/`))) {
        throw new Error(`Package ${packageName} route ${route.path} is outside its declared root paths.`);
      }
      return mutableRoute(route, helpBaseUrl, packageName, hasApiDefinitions);
    });
  });
}

function mutableNavItem(item: Readonly<VoyzuSurfaceNavItem>): VoyzuSurfaceNavItem {
  return {
    ...item,
    children: item.children?.map(mutableNavItem),
  };
}

function mutableLeftNav(
  definition: readonly {
    readonly label?: string;
    readonly items: readonly Readonly<VoyzuSurfaceNavItem>[];
  }[],
): VoyzuSurfaceNavGroup[] {
  return definition.map((group) => ({
    ...group,
    items: group.items.map(mutableNavItem),
  }));
}

const authPageRoutes = packagePageRoutes(
  voyzuAuthPackage,
  authPackage.voyzu.rootPaths,
  authPackage.name,
  authPackage.voyzu.settings.helpBaseUrl,
);
const auditPageRoutes = packagePageRoutes(
  voyzuAuditPackage,
  auditPackage.voyzu.rootPaths,
  auditPackage.name,
  auditPackage.voyzu.settings.helpBaseUrl,
);
const welcomePageRoutes = packagePageRoutes(
  welcomePackage,
  welcomePackageJson.voyzu.rootPaths,
  welcomePackageJson.name,
  welcomePackageJson.voyzu.settings.helpBaseUrl,
);
const uiReferencePageRoutes = packagePageRoutes(
  uiReferencePackage,
  uiReferencePackageJson.voyzu.rootPaths,
  uiReferencePackageJson.name,
  uiReferencePackageJson.voyzu.settings.helpBaseUrl,
);
const apiReferencePageRoutes = packagePageRoutes(
  apiReferencePackage,
  apiReferencePackageJson.voyzu.rootPaths,
  apiReferencePackageJson.name,
  apiReferencePackageJson.voyzu.settings.helpBaseUrl,
);
const packageManagementPageRoutes = packagePageRoutes(
  voyzuPackageManagementPackage,
  packageManagementPackageJson.voyzu.rootPaths,
  packageManagementPackageJson.name,
  packageManagementPackageJson.voyzu.settings.helpBaseUrl,
);
const systemInfoPageRoutes = packagePageRoutes(
  systemInfoPackage,
  systemInfoPackageJson.voyzu.rootPaths,
  systemInfoPackageJson.name,
  systemInfoPackageJson.voyzu.settings.helpBaseUrl,
);

const welcomeDefaultRoute = welcomePageRoutes.find(({ id }) => id === welcomeTopNav.routeId);
if (!welcomeDefaultRoute) {
  throw new Error("Welcome top-nav route was not found.");
}
const welcomeSurfaceDomain: VoyzuComposedSurfaceDomain = {
  id: welcomePackageJson.name,
  packageName: welcomePackageJson.name,
  label: welcomeTopNav.label,
  defaultPath: welcomeDefaultRoute.path,
  routePaths: welcomePageRoutes.map(({ id, path }) => ({ id, path })),
  leftNav: [],
};

const uiReferenceLeftNav = mutableLeftNav(uiReferenceLeftNavDefinition);
const uiReferenceDefaultRoute = uiReferencePageRoutes.find(
  ({ id }) => id === uiReferenceTopNav.routeId,
);
if (!uiReferenceDefaultRoute) {
  throw new Error("UI Reference top-nav route was not found.");
}
const uiReferenceSurfaceDomain: VoyzuComposedSurfaceDomain = {
  id: uiReferencePackageJson.name,
  packageName: uiReferencePackageJson.name,
  label: uiReferenceTopNav.label,
  defaultPath: uiReferenceDefaultRoute.path,
  routePaths: uiReferencePageRoutes.map(({ id, path }) => ({ id, path })),
  leftNav: uiReferenceLeftNav,
};
const apiReferenceLeftNav = mutableLeftNav(apiReferenceLeftNavDefinition);
const apiReferenceDefaultRoute = apiReferencePageRoutes.find(
  ({ id }) => id === apiReferenceTopNav.routeId,
);
if (!apiReferenceDefaultRoute) {
  throw new Error("API Reference top-nav route was not found.");
}
const apiReferenceSurfaceDomain: VoyzuComposedSurfaceDomain = {
  id: apiReferencePackageJson.name,
  packageName: apiReferencePackageJson.name,
  label: apiReferenceTopNav.label,
  defaultPath: apiReferenceDefaultRoute.path,
  routePaths: apiReferencePageRoutes.map(({ id, path }) => ({ id, path })),
  leftNav: apiReferenceLeftNav,
};
const composedSurfaceDomains = createComposedSurfaceDomains([
  ...authPageRoutes,
  ...auditPageRoutes,
  ...welcomePageRoutes,
  ...uiReferencePageRoutes,
  ...apiReferencePageRoutes,
  ...packageManagementPageRoutes,
  ...systemInfoPageRoutes,
]);
const packageSurfaceDomains = [
  welcomeSurfaceDomain,
  uiReferenceSurfaceDomain,
  apiReferenceSurfaceDomain,
  ...composedSurfaceDomains,
];

const pageRoutes: VoyzuSurfaceRoute[] = [
  ...authPageRoutes,
  ...auditPageRoutes,
  ...welcomePageRoutes,
  ...uiReferencePageRoutes,
  ...apiReferencePageRoutes,
  ...packageManagementPageRoutes,
  ...systemInfoPageRoutes,
  ...composedPageRoutes,
];

const packageManagementItems = packageManagementSettingsLeftNav.flatMap((group) => group.items);
const systemInfoItems = systemInfoSettingsLeftNav.flatMap((group) => group.items);
const settingsLeftNav: VoyzuSurfaceNavGroup[] = authSettingsLeftNav.map(
  (group, index) => ({
    ...group,
    items: index === 0 ? [...group.items, ...packageManagementItems, ...systemInfoItems] : [...group.items],
  }),
);
const settingsPageRoutes = [...authPageRoutes, ...packageManagementPageRoutes, ...systemInfoPageRoutes].filter(
  ({ path }) => path.startsWith("/settings/"),
);
const settingsRoutePaths = settingsPageRoutes.map(({ id, path }) => ({ id, path }));
const leftNavRouteIds = [
  ...settingsPageRoutes.map(({ id }) => id),
  ...packageSurfaceDomains
    .filter((domain) => domain.leftNav.length > 0)
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
      packageDomains: packageSurfaceDomains,
    }),
  },

  pageRoutes,
  leftNav: [
    ...uiReferenceLeftNav,
    ...apiReferenceLeftNav,
    ...composedLeftNav,
    ...settingsLeftNav,
  ],
  leftNavRouteIds,
  mainRegistrations: composedMainRegistrations,
} satisfies VoyzuSurfaceConfig;
