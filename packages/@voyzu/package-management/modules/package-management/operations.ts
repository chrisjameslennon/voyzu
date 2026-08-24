import "server-only";

import * as service from "./server/lib/installed-package.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const reconcileInstalledPackages = operation(service.reconcileInstalledPackages);
export const listInstalledPackages = operation(service.listInstalledPackages);
export const getInstalledPackage = operation(service.getInstalledPackage);
export const updateInstalledPackageVisibility = operation(service.updateInstalledPackageVisibility);
export const getHomePageRoute = operation(service.getHomePageRoute);
export const updateHomePageRoute = operation(service.updateHomePageRoute);
export const moveInstalledPackage = operation(service.moveInstalledPackage);
export const areInstalledPackagePageRoutesVisible = operation(
  service.areInstalledPackagePageRoutesVisible,
);
export const isInstalledPackageTopNavigationVisible = operation(
  service.isInstalledPackageTopNavigationVisible,
);

export const operations = {
  reconcileInstalledPackages,
  listInstalledPackages,
  getInstalledPackage,
  updateInstalledPackageVisibility,
  getHomePageRoute,
  updateHomePageRoute,
  moveInstalledPackage,
  areInstalledPackagePageRoutesVisible,
  isInstalledPackageTopNavigationVisible,
} as const;
