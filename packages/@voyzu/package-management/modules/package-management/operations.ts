import "server-only";

import * as installedPackageService from "./server/lib/installed-package.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const reconcileInstalledPackages = operation(installedPackageService.reconcileInstalledPackages);
export const listInstalledPackages = operation(installedPackageService.listInstalledPackages);
export const getInstalledPackage = operation(installedPackageService.getInstalledPackage);
export const updateInstalledPackageVisibility = operation(installedPackageService.updateInstalledPackageVisibility);
export const getHomePageRoute = operation(installedPackageService.getHomePageRoute);
export const updateHomePageRoute = operation(installedPackageService.updateHomePageRoute);
export const moveInstalledPackage = operation(installedPackageService.moveInstalledPackage);
export const areInstalledPackagePageRoutesVisible = operation(
  installedPackageService.areInstalledPackagePageRoutesVisible,
);
export const isInstalledPackageTopNavigationVisible = operation(
  installedPackageService.isInstalledPackageTopNavigationVisible,
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
