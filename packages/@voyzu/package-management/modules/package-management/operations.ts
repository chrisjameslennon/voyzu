import "server-only";

import { operation } from "@voyzu/capability/operations";
import {
  HomePageRouteResponseDto,
  InstalledPackageResponseDto,
} from "@voyzu/package-management/types";
import Type from "typebox";

const InstalledPackageList = Type.Array(InstalledPackageResponseDto);
const HomePageRoute = HomePageRouteResponseDto.properties.route;
const PackageCode = Type.Union([Type.String(), Type.Undefined()]);
const loadService = () => import("./server/lib/installed-package.service");

export const reconcileInstalledPackages = operation.defineLazy(
  { parameters: Type.Tuple([]), result: InstalledPackageList },
  () => loadService().then((module) => module.reconcileInstalledPackages),
);
export const listInstalledPackages = operation.defineLazy(
  { parameters: Type.Tuple([]), result: InstalledPackageList },
  () => loadService().then((module) => module.listInstalledPackages),
);
export const getInstalledPackage = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.Integer({ minimum: 1 })]),
    result: Type.Union([InstalledPackageResponseDto, Type.Null()]),
  },
  () => loadService().then((module) => module.getInstalledPackage),
);
export const updateInstalledPackageVisibility = operation.defineLazy(
  {
    parameters: Type.Tuple([
      Type.Integer({ minimum: 1 }),
      Type.Boolean(),
      Type.Boolean(),
    ]),
    result: InstalledPackageResponseDto,
  },
  () => loadService().then((module) => module.updateInstalledPackageVisibility),
);
export const getHomePageRoute = operation.defineLazy(
  { parameters: Type.Tuple([]), result: HomePageRoute },
  () => loadService().then((module) => module.getHomePageRoute),
);
export const updateHomePageRoute = operation.defineLazy(
  { parameters: Type.Tuple([HomePageRoute]), result: HomePageRoute },
  () => loadService().then((module) => module.updateHomePageRoute),
);
export const moveInstalledPackage = operation.defineLazy(
  {
    parameters: Type.Tuple([
      Type.Integer({ minimum: 1 }),
      Type.Union([Type.Literal("up"), Type.Literal("down")]),
    ]),
    result: InstalledPackageList,
  },
  () => loadService().then((module) => module.moveInstalledPackage),
);
export const areInstalledPackagePageRoutesVisible = operation.defineLazy(
  { parameters: Type.Tuple([PackageCode]), result: Type.Boolean() },
  () => loadService().then((module) => module.areInstalledPackagePageRoutesVisible),
);
export const isInstalledPackageTopNavigationVisible = operation.defineLazy(
  { parameters: Type.Tuple([PackageCode]), result: Type.Boolean() },
  () => loadService().then((module) => module.isInstalledPackageTopNavigationVisible),
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
