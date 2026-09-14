import type { PackageContracts } from "./contracts";

export interface VoyzuPackageModuleDefinition {
  defines?: NonNullable<PackageContracts["internalApi"]>["defines"];
  implements?: NonNullable<PackageContracts["internalApi"]>["implements"];
  pageRoutes: Readonly<Record<string, unknown>>;
}

/**
 * Metadata stored under the `voyzu` key in a package.json file.
 */
export interface VoyzuPackageMetadata {
  "voyzu-package": true;
  allowInstall: boolean;
  dependencies: readonly string[];
  preinstalled?: boolean;
  settings?: VoyzuPackageSettings;
}

export interface VoyzuPackageSettings {
  helpBaseUrl?: string;
}

export interface VoyzuPackageNavigationItem {
  label: string;
  icon?: string;
  routeId?: string;
  path?: string;
  exactMatch?: boolean;
  children?: readonly VoyzuPackageNavigationItem[];
}

export type VoyzuSettingsNavigationSlotId =
  | "settings.main"
  | "settings.integration";

export interface VoyzuPackageNavigationGroup {
  label?: string;
  slotId?: VoyzuSettingsNavigationSlotId;
  items: readonly VoyzuPackageNavigationItem[];
}

/**
 * One independently selectable application domain supplied by a package.
 * rootPath selects all pages declared under that root, including pages absent
 * from left navigation.
 */
export interface VoyzuPackageNavigationDomain {
  label: string;
  routeId: string;
  rootPath: string;
  leftNav: readonly VoyzuPackageNavigationGroup[];
  topNavigationVisible?: boolean;
}

export interface VoyzuPackageInstallDefinition {
  sql?: readonly string[];
  seedSql?: readonly string[];
}

export interface VoyzuPackageUninstallDefinition {
  sql?: readonly string[];
}

export type VoyzuPackageScript = () => void | Promise<void>;

export interface VoyzuPackageScripts {
  [name: string]: VoyzuPackageScript | undefined;
  sampleData?: VoyzuPackageScript;
}

/**
 * The composition contract exported by a package's `voyzu.package.ts`.
 *
 * Voyzu itself is an implicit dependency. Explicit peer and runtime package requirements
 * remain in package.json.
 */
export interface VoyzuPackageDefinition<
  TModule extends VoyzuPackageModuleDefinition = VoyzuPackageModuleDefinition,
> {
  modules: readonly TModule[];
  contracts?: PackageContracts;
  install?: VoyzuPackageInstallDefinition;
  uninstall?: VoyzuPackageUninstallDefinition;
  scripts?: VoyzuPackageScripts;
}
