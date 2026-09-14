import { createElement } from "react";
import type {
  VoyzuSurfaceConfig,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRoute,
} from "@voyzu/ui-surface/types";

import apiReferenceGeneratedLeftNav from "../../.generated/api-reference/navigation.json";
import {
  createPreInstalledPackageDomains,
  preInstalledNavigation,
  preInstalledPackageMainRegistrations,
} from "../../.generated/navigation/pre-installed";
import {
  createInstalledPackageDomains,
  installedNavigation,
  installedPackageMainRegistrations,
} from "../../.generated/navigation/installed";
import { preInstalledPageRoutes } from "../../.generated/page-routes/pre-installed";
import { installedPageRoutes } from "../../.generated/page-routes/installed";
import { PackageTopNav } from "./packages/PackageTopNav";
import { SurfaceLeftNav } from "./SurfaceLeftNav";
import { SessionUserMenu } from "./top-nav/SessionUserMenu";
import { VoyzuBrand } from "./top-nav/VoyzuBrand";

type ReadonlyNavItem = Omit<Readonly<VoyzuSurfaceNavItem>, "children"> & {
  readonly children?: readonly ReadonlyNavItem[];
};

type ReadonlyNavigationGroup = {
  readonly label?: string;
  readonly slotId?: string;
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

type NavigationRegistration = NavigationDefinition & { readonly packageName: string };

const navigationRegistrations = [
  ...preInstalledNavigation,
  ...installedNavigation,
] as readonly NavigationRegistration[];

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

const preInstalledSurfaceDomains = createPreInstalledPackageDomains(installedPageRoutes);
const installedSurfaceDomains = createInstalledPackageDomains(preInstalledPageRoutes);
const packageSurfaceDomains = [
  ...preInstalledSurfaceDomains.map((domain) =>
    domain.packageName === "@voyzu/api-reference"
      ? { ...domain, leftNav: [...domain.leftNav, ...mutableLeftNav(apiReferenceGeneratedLeftNav)] }
      : domain
  ),
  ...installedSurfaceDomains,
];

const settingsNavigationGroups = navigationRegistrations.flatMap(({ topNav, domains, leftNav }) =>
  mutableLeftNav(leftNav).filter(({ slotId }) =>
    (!topNav && !domains) || slotId?.startsWith("settings."),
  ),
);
const settingsLeftNav: VoyzuSurfaceNavGroup[] = [
  {
    label: "Settings",
    items: settingsNavigationGroups
      .filter(({ slotId }) => !slotId || slotId === "settings.main")
      .flatMap(({ items }) => items),
  },
  {
    label: "Integration",
    items: settingsNavigationGroups
      .filter(({ slotId }) => slotId === "settings.integration")
      .flatMap(({ items }) => items),
  },
].filter(({ items }) => items.length > 0);

const pageRoutes: VoyzuSurfaceRoute[] = [
  ...preInstalledPageRoutes,
  ...installedPageRoutes,
];
const settingsPageRoutes = pageRoutes.filter(
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
    ...packageSurfaceDomains.flatMap((domain) => domain.leftNav),
    ...settingsLeftNav,
  ],
  leftNavRouteIds,
  mainRegistrations: [
    ...preInstalledPackageMainRegistrations,
    ...installedPackageMainRegistrations,
  ],
} satisfies VoyzuSurfaceConfig;
