#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";
import { tsImport } from "tsx/esm/api";

function printHelp() {
  console.log(`Usage:
  voyzu-compose --packages-root <directory> [options]

Options:
  --packages-root <path>  Installed Voyzu package root.
  --runtime <path>        Voyzu platform root. Defaults to the current directory.
  --workspace <path>      npm workspace root. Defaults to the runtime root.
  --package <name>        Package to compose. Repeat to select multiple packages.
  --modules <path>        Legacy repository layout alias.
  --empty-if-missing      Create an empty composition only when none exists.
  --help                  Show this help.
`);
}

function parseArgs(args) {
  const options = {
    packagesRoot: undefined,
    legacyModulesRoot: undefined,
    packages: [],
    runtime: process.cwd(),
    workspace: undefined,
    emptyIfMissing: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (argument === "--packages-root") {
      options.packagesRoot = args[++index];
    } else if (argument === "--modules") {
      options.legacyModulesRoot = args[++index];
    } else if (argument === "--package") {
      options.packages.push(args[++index]);
    } else if (argument === "--runtime") {
      options.runtime = args[++index];
    } else if (argument === "--workspace") {
      options.workspace = args[++index];
    } else if (argument === "--empty-if-missing") {
      options.emptyIfMissing = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (options.help) return options;
  if (
    !options.emptyIfMissing
    && !options.packagesRoot
    && !options.legacyModulesRoot
  ) {
    throw new Error("--packages-root is required.");
  }
  if (options.packages.some((name) => !name)) {
    throw new Error("--package requires an npm package name.");
  }
  return options;
}

const cliOptions = parseArgs(process.argv.slice(2));
const runtimeRoot = resolve(cliOptions.runtime);
const workspaceRoot = resolve(cliOptions.workspace ?? runtimeRoot);
const packagesRoot = cliOptions.packagesRoot
  ? resolve(cliOptions.packagesRoot)
  : cliOptions.legacyModulesRoot
    ? resolve(cliOptions.legacyModulesRoot, "packages", "@voyzu-modules")
    : undefined;
const webRoot = join(runtimeRoot, "apps", "web");
const generatedApiRoutesRoot = join(webRoot, ".generated", "api-routes");
const generatedPageRoutesRoot = join(webRoot, ".generated", "page-routes");
const generatedNavigationRoot = join(webRoot, ".generated", "navigation");
const generatedOperationsRoot = join(webRoot, ".generated", "operations");
const generatedRoutesRoot = join(webRoot, "app", "(generated)");
const composingPlatformPackages = packagesRoot === join(runtimeRoot, "packages");

const PREINSTALLED_NAVIGATION_ORDER = [
  "@voyzu/welcome",
  "@voyzu/ui-reference",
  "@voyzu/api-reference",
  "@voyzu/auth",
  "@voyzu/localization",
  "@voyzu/package-management",
  "@voyzu/system-info",
  "@voyzu/audit",
];

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function exportedTargets(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(exportedTargets);
}

function hasExport(manifest, exportName) {
  return exportedTargets(manifest.exports?.[exportName]).length > 0;
}

async function candidatePackageDirectories(root) {
  if (!(await pathExists(root))) return [];
  const directories = [];
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const path = join(root, entry.name);
    if (entry.name.startsWith("@")) {
      const scopedEntries = await readdir(path, { withFileTypes: true });
      for (const scopedEntry of scopedEntries.sort((left, right) =>
        left.name.localeCompare(right.name)
      )) {
        if (scopedEntry.isDirectory() || scopedEntry.isSymbolicLink()) {
          directories.push(join(path, scopedEntry.name));
        }
      }
    } else {
      directories.push(path);
    }
  }
  return directories;
}

async function discoverPackages(selectedPackageNames) {
  const selected = selectedPackageNames.length
    ? new Set(selectedPackageNames)
    : undefined;
  const packages = [];

  for (const directory of await candidatePackageDirectories(packagesRoot)) {
    const manifestPath = join(directory, "package.json");
    if (!(await pathExists(manifestPath))) {
      console.warn(`Skipping ${directory}: no package.json.`);
      continue;
    }

    const manifest = await readJson(manifestPath);
    if (manifest.voyzu?.["voyzu-package"] !== true) {
      console.warn(
        `Skipping ${manifest.name || directory}: voyzu.voyzu-package is not true.`,
      );
      continue;
    }
    if (!manifest.name) {
      throw new Error(`Voyzu package has no npm name: ${manifestPath}`);
    }
    if (manifest.voyzu.preinstalled === true) {
      if (composingPlatformPackages) continue;
      throw new Error(
        `Installed package ${manifest.name} cannot declare voyzu.preinstalled.`,
      );
    }
    if (typeof manifest.repository !== "string" || manifest.repository.trim().length === 0) {
      throw new Error(`${manifest.name} package.json repository must be a non-empty URL.`);
    }
    if (typeof manifest.voyzu.allowInstall !== "boolean") {
      throw new Error(`${manifest.name} voyzu.allowInstall must be a boolean.`);
    }
    if (
      !Array.isArray(manifest.voyzu.dependencies)
      || manifest.voyzu.dependencies.some((name) => typeof name !== "string" || name.length === 0)
    ) {
      throw new Error(`${manifest.name} voyzu.dependencies must be an array of package names.`);
    }
    validateRootPaths(manifest.name, "pageRootPaths", manifest.voyzu.pageRootPaths);
    validateRootPaths(manifest.name, "apiRootPaths", manifest.voyzu.apiRootPaths);
    validateRootPaths(manifest.name, "apiRootPaths", manifest.voyzu.apiRootPaths);
    const helpBaseUrl = manifest.voyzu?.settings?.helpBaseUrl;
    if (
      helpBaseUrl !== undefined
      && (typeof helpBaseUrl !== "string" || helpBaseUrl.trim().length === 0)
    ) {
      throw new Error(
        `${manifest.name} voyzu.settings.helpBaseUrl must be a non-empty string.`,
      );
    }
    const packagePath = relative(packagesRoot, directory).replaceAll("\\", "/");
    const packagePathParts = packagePath.split("/");
    if (
      packagePathParts.length !== 2
      || !packagePathParts[0].startsWith("@")
      || manifest.name !== packagePath
    ) {
      throw new Error(
        `Installed package directory ${packagePath} declares ${manifest.name}. Expected a matching @publisher/package-name.`,
      );
    }
    if (selected && !selected.has(manifest.name)) continue;
    if (!(await pathExists(join(directory, "voyzu.package.ts")))) {
      throw new Error(`${manifest.name} does not contain voyzu.package.ts.`);
    }

    if (!hasExport(manifest, "./voyzu-package")) {
      throw new Error(`${manifest.name} must export ./voyzu-package.`);
    }

    packages.push({
      name: manifest.name,
      directory,
      workspace: relative(workspaceRoot, directory).replaceAll("\\", "/"),
      hasDomains: hasExport(manifest, "./navigation/domains"),
      hasTopNav: hasExport(manifest, "./navigation/top-nav"),
      hasLeftNav: hasExport(manifest, "./navigation/left-nav"),
      hasLeftNavHeader: hasExport(manifest, "./navigation/left-nav-header"),
      operationModules: Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
        const match = exportName.match(/^\.\/([^/]+)\/operations$/);
        return match ? [match[1]] : [];
      }),
      pageRouteModules: Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
        const match = exportName.match(/^\.\/([^/]+)\/pages\.routes$/);
        return match ? [match[1]] : [];
      }),
      apiRouteModules: Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
        const match = exportName.match(/^\.\/([^/]+)\/api\.routes$/);
        return match ? [match[1]] : [];
      }),
      helpBaseUrl,
      pageRootPaths: manifest.voyzu.pageRootPaths,
      apiRootPaths: manifest.voyzu.apiRootPaths,
    });
    const packageInfo = packages.at(-1);
    if (packageInfo.pageRootPaths.length > 0 && packageInfo.pageRouteModules.length === 0) {
      throw new Error(
        `${manifest.name} declares page root paths but exports no ./<module>/pages.routes surface.`,
      );
    }
    if (packageInfo.apiRootPaths.length > 0 && packageInfo.apiRouteModules.length === 0) {
      throw new Error(
        `${manifest.name} declares API root paths but exports no ./<module>/api.routes surface.`,
      );
    }
    console.log(`Including ${manifest.name}.`);
  }

  if (selected) {
    const found = new Set(packages.map(({ name }) => name));
    const missing = [...selected].filter((name) => !found.has(name));
    if (missing.length) {
      throw new Error(`Selected Voyzu packages not found: ${missing.join(", ")}.`);
    }
  }
  assertUniqueRootPaths(packages);
  return packages;
}

async function discoverPreinstalledPackages() {
  const platformPackagesRoot = join(runtimeRoot, "packages");
  const packages = [];

  for (const directory of await candidatePackageDirectories(platformPackagesRoot)) {
    const manifestPath = join(directory, "package.json");
    if (!(await pathExists(manifestPath))) continue;
    const manifest = await readJson(manifestPath);
    if (
      manifest.voyzu?.["voyzu-package"] !== true
      || manifest.voyzu.preinstalled !== true
    ) {
      continue;
    }
    if (!manifest.name) {
      throw new Error(`Preinstalled Voyzu package has no npm name: ${manifestPath}`);
    }
    validateRootPaths(manifest.name, "pageRootPaths", manifest.voyzu.pageRootPaths);
    const pageRouteModules = Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
      const match = exportName.match(/^\.\/([^/]+)\/pages\.routes$/);
      return match ? [match[1]] : [];
    });
    const apiRouteModules = Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
      const match = exportName.match(/^\.\/([^/]+)\/api\.routes$/);
      return match ? [match[1]] : [];
    });
    const operationModules = Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
      const match = exportName.match(/^\.\/([^/]+)\/operations$/);
      return match ? [match[1]] : [];
    });
    if (manifest.voyzu.pageRootPaths.length > 0 && pageRouteModules.length === 0) {
      throw new Error(
        `${manifest.name} declares page root paths but exports no ./<module>/pages.routes surface.`,
      );
    }
    if (manifest.voyzu.apiRootPaths.length > 0 && apiRouteModules.length === 0) {
      throw new Error(
        `${manifest.name} declares API root paths but exports no ./<module>/api.routes surface.`,
      );
    }
    packages.push({
      name: manifest.name,
      pageRootPaths: manifest.voyzu.pageRootPaths,
      pageRouteModules,
      apiRootPaths: manifest.voyzu.apiRootPaths,
      apiRouteModules,
      operationModules,
      hasNavigation: hasExport(manifest, "./navigation"),
    });
  }

  return packages;
}

function validateNavigationGroups(packageName, groups, routeIds) {
  if (!Array.isArray(groups)) {
    throw new Error(`${packageName} navigation leftNav must be an array.`);
  }
  const visitItems = (items) => {
    if (!Array.isArray(items)) {
      throw new Error(`${packageName} navigation group items must be an array.`);
    }
    for (const item of items) {
      if (!item || typeof item !== "object" || typeof item.label !== "string") {
        throw new Error(`${packageName} navigation contains an invalid item.`);
      }
      if (item.routeId !== undefined) routeIds.push(item.routeId);
      if (item.children !== undefined) visitItems(item.children);
    }
  };
  for (const group of groups) {
    if (!group || typeof group !== "object") {
      throw new Error(`${packageName} navigation contains an invalid group.`);
    }
    visitItems(group.items);
  }
}

async function validatePackageSurfaces(packages, label) {
  const routes = [];
  const apiRoutes = [];
  const navigationRouteIds = [];

  for (const packageInfo of packages) {
    for (const moduleName of packageInfo.apiRouteModules) {
      const imported = await tsImport(
        `${packageInfo.name}/${moduleName}/api.routes`,
        import.meta.url,
      );
      if (!imported.apiDefinitions || typeof imported.apiDefinitions !== "object") {
        throw new Error(
          `${packageInfo.name}/${moduleName}/api.routes must export apiDefinitions.`,
        );
      }
      for (const route of Object.values(imported.apiDefinitions)) {
        if (
          !route
          || typeof route !== "object"
          || typeof route.method !== "string"
          || typeof route.path !== "string"
          || typeof route.loadHandler !== "function"
        ) {
          throw new Error(
            `${packageInfo.name}/${moduleName}/api.routes contains an invalid lazy API route.`,
          );
        }
        if (!packageInfo.apiRootPaths.some(
          (rootPath) => route.path === rootPath || route.path.startsWith(`${rootPath}/`),
        )) {
          throw new Error(
            `${packageInfo.name} API route ${route.path} is outside its declared API root paths.`,
          );
        }
        apiRoutes.push(route);
      }
    }

    for (const moduleName of packageInfo.pageRouteModules) {
      const imported = await tsImport(
        `${packageInfo.name}/${moduleName}/pages.routes`,
        import.meta.url,
      );
      if (!imported.pageRoutes || typeof imported.pageRoutes !== "object") {
        throw new Error(
          `${packageInfo.name}/${moduleName}/pages.routes must export pageRoutes.`,
        );
      }
      for (const route of Object.values(imported.pageRoutes)) {
        if (
          !route
          || typeof route !== "object"
          || typeof route.id !== "string"
          || typeof route.path !== "string"
          || typeof route.loadPage !== "function"
        ) {
          throw new Error(
            `${packageInfo.name}/${moduleName}/pages.routes contains an invalid lazy page route.`,
          );
        }
        if (!packageInfo.pageRootPaths.some(
          (rootPath) => route.path === rootPath || route.path.startsWith(`${rootPath}/`),
        )) {
          throw new Error(
            `${packageInfo.name} page route ${route.path} is outside its declared page root paths.`,
          );
        }
        routes.push({ packageName: packageInfo.name, route });
      }
    }

    if (!packageInfo.hasNavigation) continue;
    const imported = await tsImport(`${packageInfo.name}/navigation`, import.meta.url);
    const navigation = imported.default ?? imported.navigation;
    if (!navigation || typeof navigation !== "object") {
      throw new Error(`${packageInfo.name}/navigation must export a navigation object.`);
    }
    if (navigation.leftNav !== undefined) {
      validateNavigationGroups(packageInfo.name, navigation.leftNav, navigationRouteIds);
    }
    if (navigation.topNav !== undefined) {
      if (
        !navigation.topNav
        || typeof navigation.topNav.label !== "string"
        || typeof navigation.topNav.routeId !== "string"
      ) {
        throw new Error(`${packageInfo.name} navigation topNav is invalid.`);
      }
      navigationRouteIds.push(navigation.topNav.routeId);
    }
    if (navigation.domains !== undefined) {
      if (!Array.isArray(navigation.domains)) {
        throw new Error(`${packageInfo.name} navigation domains must be an array.`);
      }
      for (const domain of navigation.domains) {
        if (
          !domain
          || typeof domain.label !== "string"
          || typeof domain.routeId !== "string"
          || !Array.isArray(domain.routeIds)
        ) {
          throw new Error(`${packageInfo.name} navigation contains an invalid domain.`);
        }
        navigationRouteIds.push(domain.routeId, ...domain.routeIds);
        validateNavigationGroups(packageInfo.name, domain.leftNav, navigationRouteIds);
      }
    }
  }

  const routeIds = new Set();
  const routePaths = new Set();
  for (const { packageName, route } of routes) {
    if (routeIds.has(route.id)) {
      throw new Error(`Duplicate ${label} page route id: ${route.id}.`);
    }
    if (routePaths.has(route.path)) {
      throw new Error(`Duplicate ${label} page route path: ${route.path}.`);
    }
    routeIds.add(route.id);
    routePaths.add(route.path);
  }
  for (const routeId of navigationRouteIds) {
    if (typeof routeId !== "string" || !routeIds.has(routeId)) {
      throw new Error(`${label} navigation route id was not found: ${String(routeId)}.`);
    }
  }
  const apiRouteKeys = new Set();
  for (const route of apiRoutes) {
    const key = `${route.method} ${route.path}`;
    if (apiRouteKeys.has(key)) {
      throw new Error(`Duplicate ${label} API route: ${key}.`);
    }
    apiRouteKeys.add(key);
  }
}

function validateRootPaths(packageName, property, paths) {
  if (
    !Array.isArray(paths)
    || paths.some((rootPath) =>
      typeof rootPath !== "string"
      || !rootPath.startsWith("/")
      || rootPath === "/"
      || rootPath.includes("?")
      || rootPath.includes("#")
      || rootPath.includes("\\")
      || rootPath.endsWith("/")
    )
  ) {
    throw new Error(`${packageName} voyzu.${property} must be an array of non-root absolute paths without trailing slashes.`);
  }
}

function rootPathsCollide(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function assertUniqueRootPaths(packages) {
  for (let leftIndex = 0; leftIndex < packages.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < packages.length; rightIndex += 1) {
      const left = packages[leftIndex];
      const right = packages[rightIndex];
      for (const property of ["pageRootPaths", "apiRootPaths"]) {
        for (const leftPath of left[property]) {
          const rightPath = right[property].find((path) => rootPathsCollide(leftPath, path));
          if (rightPath) {
            throw new Error(`${left.name} and ${right.name} have colliding ${property}: ${leftPath} and ${rightPath}.`);
          }
        }
      }
    }
  }
}

async function updateWorkspaceMetadata(packages) {
  const workspacePackagePath = join(workspaceRoot, "package.json");
  const platformPackagePath = join(runtimeRoot, "package.json");
  const webPackagePath = join(webRoot, "package.json");
  const workspacePackage = await readJson(workspacePackagePath);
  const platformPackage = await readJson(platformPackagePath);
  const webPackage = await readJson(webPackagePath);
  const previousNames = new Set([
    ...(workspacePackage.voyzu?.composedPackages ?? []),
    ...(webPackage.voyzu?.composedPackages ?? []),
  ]);
  const names = packages.map(({ name }) => name);

  if (workspacePackage.voyzu) {
    delete workspacePackage.voyzu.composedPackages;
  }
  workspacePackage.dependencies = { ...(platformPackage.dependencies ?? {}) };
  delete workspacePackage.devDependencies;
  if (platformPackage.allowScripts) {
    workspacePackage.allowScripts = { ...platformPackage.allowScripts };
  } else {
    delete workspacePackage.allowScripts;
  }
  if (platformPackage.packageManager) {
    workspacePackage.packageManager = platformPackage.packageManager;
  }

  webPackage.dependencies ??= {};
  for (const previousName of previousNames) delete webPackage.dependencies[previousName];
  for (const name of names) webPackage.dependencies[name] = "*";
  webPackage.dependencies = Object.fromEntries(
    Object.entries(webPackage.dependencies).sort(([left], [right]) =>
      left.localeCompare(right)
    ),
  );
  webPackage.voyzu = {
    ...(webPackage.voyzu ?? {}),
    composedPackages: names,
  };

  await writeJson(workspacePackagePath, workspacePackage);
  await writeJson(webPackagePath, webPackage);
  return [...previousNames];
}

function packagePublicAssetDirectory(packageName) {
  if (!/^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/.test(packageName)) {
    throw new Error(`Invalid package name for public assets: ${packageName}.`);
  }
  return join(webRoot, "public", ...packageName.split("/"));
}

async function syncPackagePublicAssets(packages, previousPackageNames) {
  const packageNames = new Set([
    ...previousPackageNames,
    ...packages.map(({ name }) => name),
  ]);

  for (const packageName of packageNames) {
    await rm(packagePublicAssetDirectory(packageName), { recursive: true, force: true });
  }

  for (const packageInfo of packages) {
    const source = join(packageInfo.directory, "public-assets");
    if (!(await pathExists(source))) continue;
    const target = packagePublicAssetDirectory(packageInfo.name);
    await mkdir(dirname(target), { recursive: true });
    await cp(source, target, { recursive: true });
    console.log(
      `Published ${packageInfo.name} assets at /${packageInfo.name}/.`,
    );
  }
}

async function updateNextConfig(packages) {
  const configPath = join(webRoot, "next.config.ts");
  const startMarker = "      // voyzu compose:packages:start";
  const endMarker = "      // voyzu compose:packages:end";
  let source = await readFile(configPath, "utf8");
  const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  source = source.replace(
    new RegExp(`\\n${escapedStart}[\\s\\S]*?${escapedEnd}\\n`),
    "\n",
  );

  const block = [
    startMarker,
    ...packages.map(({ name }) => `      ${JSON.stringify(name)},`),
    endMarker,
  ].join("\n");
  const anchor = "    transpilePackages: [";
  if (!source.includes(anchor)) {
    throw new Error(`Could not find transpilePackages in ${configPath}.`);
  }
  source = source.replace(anchor, `${anchor}\n${block}`);
  await writeFile(configPath, source, "utf8");
}

async function updateTypeScriptConfig() {
  const configPath = join(webRoot, "tsconfig.json");
  const config = await readJson(configPath);
  if (config.compilerOptions) {
    delete config.compilerOptions.preserveSymlinks;
  }
  await writeJson(configPath, config);
}

async function clearNextCache() {
  const cachePath = join(webRoot, ".next");
  await rm(cachePath, { recursive: true, force: true });
  console.log("Cleared the Next.js cache; restart the development server if it is running.");
}

function generatedPreinstalledPageRoutes(packages) {
  const registrations = packages.flatMap(({ name, pageRouteModules }) =>
    pageRouteModules.map((moduleName) => ({
      importName: `pageRoutes${name.replace(/[^a-zA-Z0-9]/g, "_")}_${moduleName.replace(/[^a-zA-Z0-9]/g, "_")}`,
      importPath: `${name}/${moduleName}/pages.routes`,
    })),
  );
  const imports = registrations.map(({ importName, importPath }) =>
    `import { pageRoutes as ${importName} } from ${JSON.stringify(importPath)};`);
  const routes = registrations.map(({ importName }) =>
    `  ...(Object.values(${importName}) as VoyzuSurfaceRoute[]),`);

  return `// Generated by voyzu compose. Do not edit.
import type { VoyzuSurfaceRoute } from "@voyzu/ui-surface/types";

${imports.join("\n")}

export const preinstalledPageRoutes: VoyzuSurfaceRoute[] = [
${routes.join("\n")}
];
`;
}

function generatedPreinstalledApiRoutes(packages) {
  const registrations = packages.flatMap(({ name, apiRouteModules }) =>
    apiRouteModules.map((moduleName) => ({
      importName: `apiDefinitions${name.replace(/[^a-zA-Z0-9]/g, "_")}_${moduleName.replace(/[^a-zA-Z0-9]/g, "_")}`,
      importPath: `${name}/${moduleName}/api.routes`,
      packageName: name,
      moduleName,
    })),
  );
  const imports = registrations.map(({ importName, importPath }) =>
    `import { apiDefinitions as ${importName} } from ${JSON.stringify(importPath)};`);
  const modules = registrations.map(({ importName, packageName, moduleName }) =>
    `  { packageName: ${JSON.stringify(packageName)}, moduleName: ${JSON.stringify(moduleName)}, routes: Object.values(${importName}) as VoyzuApiModuleRoute[] },`);

  return `// Generated by voyzu compose. Do not edit.
import type { VoyzuApiModuleRoute } from "@voyzu/api";

${imports.join("\n")}

export const preinstalledApiRouteModules = [
${modules.join("\n")}
];

export const preinstalledApiRoutes: VoyzuApiModuleRoute[] = [
  ...preinstalledApiRouteModules.flatMap(({ routes }) => routes),
];
`;
}

function generatedInstalledApiRoutes(packages) {
  const registrations = packages.flatMap(({ name, apiRouteModules }) =>
    apiRouteModules.map((moduleName) => ({
      importName: `apiDefinitions${name.replace(/[^a-zA-Z0-9]/g, "_")}_${moduleName.replace(/[^a-zA-Z0-9]/g, "_")}`,
      importPath: `${name}/${moduleName}/api.routes`,
      packageName: name,
      moduleName,
    })),
  );
  const imports = registrations.map(({ importName, importPath }) =>
    `import { apiDefinitions as ${importName} } from ${JSON.stringify(importPath)};`);
  const modules = registrations.map(({ importName, packageName, moduleName }) =>
    `  { packageName: ${JSON.stringify(packageName)}, moduleName: ${JSON.stringify(moduleName)}, routes: Object.values(${importName}) as VoyzuApiModuleRoute[] },`);

  return `// Generated by voyzu compose. Do not edit.
import type { VoyzuApiModuleRoute } from "@voyzu/api";

${imports.join("\n")}

export const installedApiRouteModules: {
  packageName: string;
  moduleName: string;
  routes: VoyzuApiModuleRoute[];
}[] = [
${modules.join("\n")}
];

export const installedApiRoutes: VoyzuApiModuleRoute[] = [
  ...installedApiRouteModules.flatMap(({ routes }) => routes),
];
`;
}

function generatedInstalledPageRoutes(packages) {
  const registrations = packages.flatMap(({ name, pageRouteModules, apiRouteModules, helpBaseUrl }) =>
    pageRouteModules.map((moduleName) => ({
      importName: `pageRoutes${name.replace(/[^a-zA-Z0-9]/g, "_")}_${moduleName.replace(/[^a-zA-Z0-9]/g, "_")}`,
      importPath: `${name}/${moduleName}/pages.routes`,
      packageName: name,
      moduleName,
      helpBaseUrl,
      hasApiRoutes: apiRouteModules.includes(moduleName),
    })),
  );
  const imports = registrations.map(({ importName, importPath }) =>
    `import { pageRoutes as ${importName} } from ${JSON.stringify(importPath)};`);
  const modules = registrations.map(({
    importName,
    packageName,
    moduleName,
    helpBaseUrl,
    hasApiRoutes,
  }) =>
    `  { packageName: ${JSON.stringify(packageName)}, moduleName: ${JSON.stringify(moduleName)}, helpBaseUrl: ${
      helpBaseUrl === undefined ? "undefined" : JSON.stringify(helpBaseUrl)
    }, apiDocsUrl: ${
      hasApiRoutes ? JSON.stringify(`/api-reference/${packageName.replace("/", "-")}/${moduleName}`) : "undefined"
    }, routes: Object.values(${importName}) as VoyzuSurfaceRoute[] },`);

  return `// Generated by voyzu compose. Do not edit.
import type { VoyzuSurfaceRoute } from "@voyzu/ui-surface/types";

${imports.join("\n")}

const installedPageRouteModules: {
  packageName: string;
  moduleName: string;
  helpBaseUrl: string | undefined;
  apiDocsUrl: string | undefined;
  routes: VoyzuSurfaceRoute[];
}[] = [
${modules.join("\n")}
];

export const installedPackagePageRoutes: VoyzuSurfaceRoute[] =
  installedPageRouteModules.flatMap(({ packageName, helpBaseUrl, apiDocsUrl, routes }) =>
    routes.map((route) => ({
      ...route,
      packageName,
      helpBaseUrl,
      apiDocsUrl: route.apiDocsUrl ?? apiDocsUrl,
    })),
  );
`;
}

function preinstalledNavigationPackages(packages) {
  const order = new Map(
    PREINSTALLED_NAVIGATION_ORDER.map((packageName, index) => [packageName, index]),
  );
  return packages
    .filter(({ hasNavigation }) => hasNavigation)
    .sort((left, right) => {
      const leftOrder = order.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.name) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.name.localeCompare(right.name);
    });
}

function generatedPreinstalledNavigation(packages) {
  const navigationPackages = preinstalledNavigationPackages(packages);
  const imports = navigationPackages.map(
    ({ name }, index) => `import navigation${index} from ${JSON.stringify(`${name}/navigation`)};`,
  );
  const registrations = navigationPackages.map(
    ({ name }, index) => `  { packageName: ${JSON.stringify(name)}, navigation: navigation${index} },`,
  );

  return `// Generated by voyzu compose. Do not edit.
${imports.join("\n")}

export const preinstalledNavigation = [
${registrations.join("\n")}
] as const;
`;
}

async function writeGeneratedPreinstalledSurfaces(packages) {
  await Promise.all([
    mkdir(generatedApiRoutesRoot, { recursive: true }),
    mkdir(generatedPageRoutesRoot, { recursive: true }),
    mkdir(generatedNavigationRoot, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      join(generatedApiRoutesRoot, "index.ts"),
      generatedPreinstalledApiRoutes(packages),
      "utf8",
    ),
    writeFile(
      join(generatedPageRoutesRoot, "index.ts"),
      generatedPreinstalledPageRoutes(packages),
      "utf8",
    ),
    writeFile(
      join(generatedNavigationRoot, "index.ts"),
      generatedPreinstalledNavigation(packages),
      "utf8",
    ),
  ]);
}

async function writeGeneratedInstalledApiRoutes(packages) {
  await mkdir(generatedApiRoutesRoot, { recursive: true });
  await writeFile(
    join(generatedApiRoutesRoot, "installed.ts"),
    generatedInstalledApiRoutes(packages),
    "utf8",
  );
}

async function writeGeneratedInstalledPageRoutes(packages) {
  await mkdir(generatedPageRoutesRoot, { recursive: true });
  await writeFile(
    join(generatedPageRoutesRoot, "installed.ts"),
    generatedInstalledPageRoutes(packages),
    "utf8",
  );
}

function generatedSurfaceRegistry(packages) {
  const imports = packages.flatMap(
    ({ name, hasDomains, hasTopNav, hasLeftNav }, index) => [
      ...(hasDomains
        ? [`import domains${index} from ${JSON.stringify(`${name}/navigation/domains`)};`]
        : []),
      ...(hasTopNav
        ? [`import topNav${index} from ${JSON.stringify(`${name}/navigation/top-nav`)};`]
        : []),
      ...(hasLeftNav
        ? [`import leftNav${index} from ${JSON.stringify(`${name}/navigation/left-nav`)};`]
        : []),
    ],
  );
  const registrations = packages.map(
    ({ name, hasDomains, hasTopNav, hasLeftNav }, index) =>
      `{ packageName: ${JSON.stringify(name)}, domains: ${hasDomains ? `domains${index}` : "undefined"}, topNav: ${
        hasTopNav ? `topNav${index}` : "undefined"
      }, leftNav: ${hasLeftNav ? `leftNav${index}` : "[]"} }`,
  );

  return `// Generated by voyzu compose. Do not edit.
import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceMainRegistration,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRoute,
} from "@voyzu/ui-surface/types";
import { installedPackagePageRoutes } from "../page-routes/installed";

${imports.join("\n")}

type ReadonlyNavItem = Omit<VoyzuSurfaceNavItem, "children"> & {
  readonly children?: readonly ReadonlyNavItem[];
};

type ComposedPackageRegistration = {
  readonly packageName: string;
  readonly domains: readonly {
    readonly label: string;
    readonly routeId: string;
    readonly routeIds: readonly string[];
    readonly topNavigationVisible?: boolean;
    readonly leftNav: readonly {
      readonly label?: string;
      readonly items: readonly ReadonlyNavItem[];
    }[];
  }[] | undefined;
  readonly topNav: { readonly label: string; readonly routeId: string } | undefined;
  readonly leftNav: readonly {
    readonly label?: string;
    readonly items: readonly ReadonlyNavItem[];
  }[];
};

const packages: readonly ComposedPackageRegistration[] = [${registrations.join(", ")}];

function mutableNavItem(item: ReadonlyNavItem): VoyzuSurfaceNavItem {
  return {
    ...item,
    children: item.children?.map(mutableNavItem),
  };
}

function mutableLeftNav(
  groups: readonly {
    readonly label?: string;
    readonly items: readonly ReadonlyNavItem[];
  }[],
): VoyzuSurfaceNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map(mutableNavItem),
  }));
}

export const installedPackageLeftNav: VoyzuSurfaceNavGroup[] = packages.flatMap(
  ({ domains, leftNav }) => domains
    ? domains.flatMap((domain) => mutableLeftNav(domain.leftNav))
    : mutableLeftNav(leftNav),
);

export const installedPackageMainRegistrations: VoyzuSurfaceMainRegistration[] = [];

export function createInstalledPackageDomains(
  additionalPageRoutes: readonly VoyzuSurfaceRoute[] = [],
): VoyzuComposedSurfaceDomain[] {
  const allPageRoutes = [...additionalPageRoutes, ...installedPackagePageRoutes];
  return packages.flatMap(
  ({ packageName, domains, topNav, leftNav }) => {
    const pageRoutes = installedPackagePageRoutes.filter((route) => route.packageName === packageName);
    if (domains) {
      const routeById = new Map(allPageRoutes.map((route) => [route.id, route]));
      return domains.map((domain) => {
        const defaultRoute = routeById.get(domain.routeId);
        if (!defaultRoute) {
          throw new Error(
            \`Package \${packageName} domain \${domain.label} default route \${domain.routeId} was not found.\`,
          );
        }
        const domainRoutes = domain.routeIds.map((routeId) => {
          const route = routeById.get(routeId);
          if (!route) {
            throw new Error(
              \`Package \${packageName} domain \${domain.label} route \${routeId} was not found.\`,
            );
          }
          return route;
        });
        if (!domain.routeIds.includes(domain.routeId)) {
          throw new Error(
            \`Package \${packageName} domain \${domain.label} must include its default route in routeIds.\`,
          );
        }
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
    if (!topNav) return [];
    const defaultRoute = pageRoutes.find(({ id }) => id === topNav.routeId);
    if (!defaultRoute) {
      throw new Error(
        \`Package \${packageName} top-nav route \${topNav.routeId} was not found.\`,
      );
    }
    return [{
      id: packageName,
      packageName,
      label: topNav.label,
      defaultPath: defaultRoute.path,
      routePaths: pageRoutes.map(({ id, path }) => ({ id, path })),
      leftNav: mutableLeftNav(leftNav),
    }];
  });
}

`;
}

function generatedLeftNavHeaders(packages) {
  const headers = packages.filter(({ hasLeftNavHeader }) => hasLeftNavHeader);
  const imports = headers.map(
    ({ name }, index) => `import Header${index}, { leftNavHeaderRootPaths as rootPaths${index} } from ${JSON.stringify(`${name}/navigation/left-nav-header`)};`,
  );
  const registrations = headers.map(
    ({ name }, index) => `${JSON.stringify(name)}: { Header: Header${index}, rootPaths: rootPaths${index} }`,
  );

  return `"use client";

import type { ComponentType } from "react";
import type { VoyzuSurfaceLeftNavHeaderProps } from "@voyzu/ui-surface/types";

${imports.join("\n")}

interface LeftNavHeaderRegistration {
  Header: ComponentType<VoyzuSurfaceLeftNavHeaderProps>;
  rootPaths: readonly string[];
}

const headers: Readonly<Record<string, LeftNavHeaderRegistration>> = {
  ${registrations.join(",\n  ")}
};

function matchesRootPath(pathname: string, rootPath: string) {
  return pathname === rootPath || pathname.startsWith(rootPath + "/");
}

export function hasPackageLeftNavHeader(packageName: string, pathname: string) {
  const registration = headers[packageName];
  return registration?.rootPaths.some((rootPath) => matchesRootPath(pathname, rootPath)) === true;
}

export function PackageLeftNavHeader({
  packageName,
  domainId,
  isCollapsed,
}: VoyzuSurfaceLeftNavHeaderProps & { packageName: string }) {
  const registration = headers[packageName];
  return registration ? <registration.Header domainId={domainId} isCollapsed={isCollapsed} /> : null;
}
`;
}

async function writeGeneratedNavigation(packages) {
  await mkdir(generatedNavigationRoot, { recursive: true });
  await Promise.all([
    writeFile(
      join(generatedNavigationRoot, "packages.ts"),
      generatedSurfaceRegistry(packages),
      "utf8",
    ),
    writeFile(
      join(generatedNavigationRoot, "left-nav-headers.tsx"),
      generatedLeftNavHeaders(packages),
      "utf8",
    ),
  ]);
}

function generatedOperationRegistration(packages) {
  const registrations = packages.flatMap(({ name, operationModules }, packageIndex) =>
    operationModules.map((moduleName, moduleIndex) => ({
      importName: `packageOperations${packageIndex}_${moduleIndex}`,
      importPath: `${name}/${moduleName}/operations`,
      packageName: name,
      moduleName,
    })),
  );
  const imports = registrations.map(({ importName, importPath }) =>
    `import { operations as ${importName} } from ${JSON.stringify(importPath)};`);
  const registrationLines = registrations.map(({ importName, packageName, moduleName }) =>
    `operation.registerModule(${JSON.stringify(packageName)}, ${JSON.stringify(moduleName)}, ${importName});`);

  return `// Generated by voyzu compose. Do not edit.
import { operation } from "@voyzu/capability/operations";
${imports.join("\n")}

${registrationLines.join("\n")}
`;
}

async function writeGeneratedOperations(packages) {
  await mkdir(generatedOperationsRoot, { recursive: true });
  await writeFile(
    join(generatedOperationsRoot, "register.ts"),
    generatedOperationRegistration(packages),
    "utf8",
  );
}

async function writeGeneratedPreinstalledOperations(packages) {
  await mkdir(generatedOperationsRoot, { recursive: true });
  await writeFile(
    join(generatedOperationsRoot, "preinstalled.ts"),
    generatedOperationRegistration(packages),
    "utf8",
  );
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const env = { ...process.env, ...(options.env ?? {}) };
    for (const name of Object.keys(env)) {
      if (name.toLowerCase() === "npm_config_global_ignore_file") delete env[name];
    }
    const useNpmCli = process.platform === "win32"
      && command === "npm"
      && process.env.npm_execpath;
    const executable = useNpmCli ? process.execPath : command;
    const executableArgs = useNpmCli
      ? [process.env.npm_execpath, ...args]
      : args;
    const child = spawn(executable, executableArgs, {
      stdio: "inherit",
      shell: process.platform === "win32" && command === "npm" && !useNpmCli,
      ...options,
      env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  if (cliOptions.help) {
    printHelp();
    return;
  }
  if (!(await pathExists(join(runtimeRoot, "package.json")))) {
    throw new Error(`Voyzu runtime not found: ${runtimeRoot}.`);
  }

  const preinstalledPackages = await discoverPreinstalledPackages();
  await validatePackageSurfaces(preinstalledPackages, "preinstalled");
  await Promise.all([
    writeGeneratedPreinstalledSurfaces(preinstalledPackages),
    writeGeneratedPreinstalledOperations(preinstalledPackages),
  ]);

  if (cliOptions.emptyIfMissing) {
    const compositionPath = join(
      generatedNavigationRoot,
      "packages.ts",
    );
    const leftNavHeadersPath = join(
      generatedNavigationRoot,
      "left-nav-headers.tsx",
    );
    const operationRegistrationPath = join(generatedOperationsRoot, "register.ts");
    const installedApiRoutesPath = join(generatedApiRoutesRoot, "installed.ts");
    const installedPageRoutesPath = join(generatedPageRoutesRoot, "installed.ts");
    if (!(await pathExists(compositionPath))) {
      await Promise.all([
        writeGeneratedNavigation([]),
        writeGeneratedOperations([]),
      ]);
      console.log("Created empty Voyzu package navigation registry.");
    } else if (!(await pathExists(leftNavHeadersPath))) {
      await writeFile(
        leftNavHeadersPath,
        generatedLeftNavHeaders([]),
        "utf8",
      );
      console.log("Created empty Voyzu package left-nav header composition.");
    }
    if (!(await pathExists(operationRegistrationPath))) {
      await writeGeneratedOperations([]);
      console.log("Created empty Voyzu package operation registry.");
    }
    if (!(await pathExists(installedApiRoutesPath))) {
      await writeGeneratedInstalledApiRoutes([]);
      console.log("Created empty installed-package API route index.");
    }
    if (!(await pathExists(installedPageRoutesPath))) {
      await writeGeneratedInstalledPageRoutes([]);
      console.log("Created empty installed-package page route index.");
    }
    await rm(generatedRoutesRoot, { recursive: true, force: true });
    return;
  }

  const packages = await discoverPackages(cliOptions.packages);
  await validatePackageSurfaces(packages, "installed-package");

  const previousPackageNames = await updateWorkspaceMetadata(packages);
  await syncPackagePublicAssets(packages, previousPackageNames);
  await updateNextConfig(packages);
  await updateTypeScriptConfig();
  await Promise.all([
    writeGeneratedNavigation(packages),
    writeGeneratedOperations(packages),
    writeGeneratedInstalledApiRoutes(packages),
    writeGeneratedInstalledPageRoutes(packages),
  ]);
  await rm(join(runtimeRoot, "generated-composition"), { recursive: true, force: true });
  await rm(generatedRoutesRoot, { recursive: true, force: true });
  await clearNextCache();

  console.log("Installing composed workspace dependencies...");
  await run("npm", ["install", "--package-lock=false"], {
    cwd: workspaceRoot,
  });
  console.log("Reconciling the installed package inventory...");
  await run(
    "npm",
    ["run", "voyzu:run-script", "--", "@voyzu/package-management", "refresh"],
    { cwd: runtimeRoot },
  );
  console.log("Building API Reference...");
  await run("npm", ["run", "voyzu:build-api-reference"], { cwd: runtimeRoot });
  console.log(
    `Voyzu composition complete: ${packages.length} package${packages.length === 1 ? "" : "s"}.`,
  );
}

main().catch((error) => {
  console.error("");
  console.error(`Compose failed: ${error.message}`);
  process.exitCode = 1;
});
