export interface VoyzuPackageModuleDefinition {
  pageRoutes: Readonly<Record<string, unknown>>;
  apiDefinitions: Readonly<Record<string, unknown>>;
}

/**
 * Metadata stored under the `voyzu` key in a package.json file.
 */
export interface VoyzuPackageMetadata {
  "voyzu-package": true;
  allowInstall: boolean;
  dependencies: readonly string[];
  rootPaths: readonly string[];
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

export interface VoyzuPackageNavigationGroup {
  label?: string;
  items: readonly VoyzuPackageNavigationItem[];
}

/**
 * One independently selectable application domain supplied by a package.
 * routeIds explicitly assigns every package page that belongs to the domain,
 * including detail, report, and unframed pages absent from left navigation.
 */
export interface VoyzuPackageNavigationDomain {
  label: string;
  routeId: string;
  routeIds: readonly string[];
  leftNav: readonly VoyzuPackageNavigationGroup[];
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
  install?: VoyzuPackageInstallDefinition;
  uninstall?: VoyzuPackageUninstallDefinition;
  scripts?: VoyzuPackageScripts;
}
