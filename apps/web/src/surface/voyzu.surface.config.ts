import { createElement } from "react";
import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceConfig,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRoute,
} from "@voyzu/ui-surface/types";

import { preinstalledNavigation } from "../../.generated/navigation";
import {
  createInstalledPackageDomains,
  installedPackageLeftNav,
  installedPackageMainRegistrations,
  installedPackagePageRoutes,
} from "../../.generated/navigation/packages";
import { preinstalledPageRoutes } from "../../.generated/page-routes";
import { PackageTopNav } from "./packages/PackageTopNav";
import { SurfaceLeftNav } from "./SurfaceLeftNav";
import { SessionUserMenu } from "./top-nav/SessionUserMenu";
import { VoyzuBrand } from "./top-nav/VoyzuBrand";

type ReadonlyNavItem = Omit<Readonly<VoyzuSurfaceNavItem>, "children"> & {
  readonly children?: readonly ReadonlyNavItem[];
};

type ReadonlyNavigationGroup = {
  readonly label?: string;
  readonly items: readonly ReadonlyNavItem[];
};

type NavigationDefinition = {
  readonly domains?: readonly {
    readonly label: string;
    readonly routeId: string;
    readonly routeIds: readonly string[];
    readonly topNavigationVisible?: boolean;
    readonly leftNav: readonly ReadonlyNavigationGroup[];
  }[];
  readonly topNav?: {
    readonly label: string;
    readonly routeId: string;
  };
  readonly leftNav?: readonly ReadonlyNavigationGroup[];
};

type PreinstalledNavigationRegistration = {
  readonly packageName: string;
  readonly navigation: NavigationDefinition;
};

const navigationRegistrations = preinstalledNavigation as
  readonly PreinstalledNavigationRegistration[];

function mutableNavItem(item: ReadonlyNavItem): VoyzuSurfaceNavItem {
  return {
    ...item,
    children: item.children?.map(mutableNavItem),
  };
}

function mutableLeftNav(
  groups: readonly ReadonlyNavigationGroup[] = [],
): VoyzuSurfaceNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map(mutableNavItem),
  }));
}

const routeById = new Map(
  preinstalledPageRoutes.map((route) => [route.id, route]),
);

function requiredRoute(routeId: string, packageName: string): VoyzuSurfaceRoute {
  const route = routeById.get(routeId);
  if (!route) {
    throw new Error(`Package ${packageName} navigation route ${routeId} was not found.`);
  }
  return route;
}

const preinstalledSurfaceDomains: VoyzuComposedSurfaceDomain[] =
  navigationRegistrations.flatMap(({ packageName, navigation }) => {
    if (navigation.domains) {
      return navigation.domains.map((domain) => {
        const defaultRoute = requiredRoute(domain.routeId, packageName);
        const domainRoutes = domain.routeIds.map((routeId) =>
          requiredRoute(routeId, packageName));
        return {
          id: domain.routeId,
          packageName,
          label: domain.label,
          defaultPath: defaultRoute.path,
          routePaths: domainRoutes.map(({ id, path }) => ({ id, path })),
          leftNav: mutableLeftNav(domain.leftNav),
          topNavigationVisible: domain.topNavigationVisible,
        };
      });
    }
    if (!navigation.topNav) return [];
    const defaultRoute = requiredRoute(navigation.topNav.routeId, packageName);
    const packageRoutes = preinstalledPageRoutes.filter(
      (route) =>
        route.path === defaultRoute.path
        || route.path.startsWith(`${defaultRoute.path}/`),
    );
    return [{
      id: packageName,
      packageName,
      label: navigation.topNav.label,
      defaultPath: defaultRoute.path,
      routePaths: packageRoutes.map(({ id, path }) => ({ id, path })),
      leftNav: mutableLeftNav(navigation.leftNav),
    }];
  });

const installedSurfaceDomains = createInstalledPackageDomains(
  preinstalledPageRoutes,
);
const packageSurfaceDomains = [
  ...preinstalledSurfaceDomains,
  ...installedSurfaceDomains,
];

const settingsNavigation = navigationRegistrations.filter(
  ({ navigation }) => !navigation.topNav && !navigation.domains,
);
const settingsLeftNav: VoyzuSurfaceNavGroup[] = [{
  label: "Settings",
  items: settingsNavigation.flatMap(({ navigation }) =>
    mutableLeftNav(navigation.leftNav).flatMap((group) => group.items)),
}];

const pageRoutes: VoyzuSurfaceRoute[] = [
  ...preinstalledPageRoutes,
  ...installedPackagePageRoutes,
];
const settingsPageRoutes = preinstalledPageRoutes.filter(
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
    ...preinstalledSurfaceDomains.flatMap((domain) => domain.leftNav),
    ...installedPackageLeftNav,
    ...settingsLeftNav,
  ],
  leftNavRouteIds,
  mainRegistrations: installedPackageMainRegistrations,
} satisfies VoyzuSurfaceConfig;
