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
const generatedCompositionRoot = join(runtimeRoot, "generated-composition");

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

async function candidatePackageDirectories() {
  if (!(await pathExists(packagesRoot))) return [];
  const directories = [];
  const entries = await readdir(packagesRoot, { withFileTypes: true });

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const path = join(packagesRoot, entry.name);
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

  for (const directory of await candidatePackageDirectories()) {
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
    if (
      !Array.isArray(manifest.voyzu.rootPaths)
      || manifest.voyzu.rootPaths.some((rootPath) =>
        typeof rootPath !== "string"
        || !rootPath.startsWith("/")
        || (rootPath.length > 1 && rootPath.endsWith("/"))
      )
    ) {
      throw new Error(`${manifest.name} voyzu.rootPaths must be an array of absolute paths without trailing slashes.`);
    }
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
      helpBaseUrl,
      rootPaths: manifest.voyzu.rootPaths,
    });
    console.log(`Including ${manifest.name}.`);
  }

  if (selected) {
    const found = new Set(packages.map(({ name }) => name));
    const missing = [...selected].filter((name) => !found.has(name));
    if (missing.length) {
      throw new Error(`Selected Voyzu packages not found: ${missing.join(", ")}.`);
    }
  }
  return packages;
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
  workspacePackage.devDependencies = { ...(platformPackage.devDependencies ?? {}) };
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

function generatedSurfaceRegistry(packages) {
  const imports = packages.flatMap(
    ({ name, hasDomains, hasTopNav, hasLeftNav }, index) => [
      `import packageDefinition${index} from ${JSON.stringify(`${name}/voyzu-package`)};`,
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
    ({ name, hasDomains, hasTopNav, hasLeftNav, helpBaseUrl, rootPaths }, index) =>
      `{ packageName: ${JSON.stringify(name)}, definition: packageDefinition${index}, rootPaths: ${JSON.stringify(rootPaths)}, helpBaseUrl: ${
        helpBaseUrl === undefined ? "undefined" : JSON.stringify(helpBaseUrl)
      }, domains: ${hasDomains ? `domains${index}` : "undefined"}, topNav: ${
        hasTopNav ? `topNav${index}` : "undefined"
      }, leftNav: ${hasLeftNav ? `leftNav${index}` : "[]"} }`,
  );

  return `// Generated by voyzu compose. Do not edit.
import type { VoyzuApiModule } from "@voyzu/api";
import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceMainRegistration,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRoute,
} from "@voyzu/ui-surface/types";

${imports.join("\n")}

type ReadonlyNavItem = Omit<VoyzuSurfaceNavItem, "children"> & {
  readonly children?: readonly ReadonlyNavItem[];
};

type ComposedPackageRegistration = {
  readonly packageName: string;
  readonly rootPaths: readonly string[];
  readonly definition: {
    readonly modules: readonly {
      readonly pageRoutes: Readonly<Record<string, unknown>>;
      readonly apiDefinitions: Readonly<Record<string, unknown>>;
    }[];
  };
  readonly helpBaseUrl: string | undefined;
  readonly domains: readonly {
    readonly label: string;
    readonly routeId: string;
    readonly routeIds: readonly string[];
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

function packagePageRoutes(
  packageName: string,
  rootPaths: readonly string[],
  definition: { readonly modules: readonly { readonly pageRoutes: Readonly<Record<string, unknown>>; readonly apiDefinitions: Readonly<Record<string, unknown>> }[] },
  helpBaseUrl: string | undefined,
): VoyzuSurfaceRoute[] {
  return definition.modules.flatMap(
    (moduleDefinition) => {
      const hasApiDefinitions = Object.keys(moduleDefinition.apiDefinitions).length > 0;
      return (Object.values(moduleDefinition.pageRoutes) as VoyzuSurfaceRoute[]).map(
        (route) => {
          const moduleId = route.id.match(/^voyzu\\.(.+)\\.page\\./)?.[1];
          const apiDocsUrl = hasApiDefinitions && moduleId
            ? \`/api-reference/\${packageName.replace("/", "-")}/\${moduleId}\`
            : undefined;
          if (!rootPaths.some((rootPath) => route.path === rootPath || route.path.startsWith(rootPath + "/"))) {
            throw new Error("Package " + packageName + " route " + route.path + " is outside its declared root paths.");
          }
          return { ...route, packageName, helpBaseUrl, apiDocsUrl: route.apiDocsUrl ?? apiDocsUrl };
        },
      );
    },
  );
}

export const composedPageRoutes: VoyzuSurfaceRoute[] = packages.flatMap(
  ({ packageName, rootPaths, definition, helpBaseUrl }) => packagePageRoutes(packageName, rootPaths, definition, helpBaseUrl),
);

export const composedLeftNav: VoyzuSurfaceNavGroup[] = packages.flatMap(
  ({ domains, leftNav }) => domains
    ? domains.flatMap((domain) => mutableLeftNav(domain.leftNav))
    : mutableLeftNav(leftNav),
);

export const composedMainRegistrations: VoyzuSurfaceMainRegistration[] = [];

export function createComposedSurfaceDomains(
  additionalPageRoutes: readonly VoyzuSurfaceRoute[] = [],
): VoyzuComposedSurfaceDomain[] {
  const allPageRoutes = [...additionalPageRoutes, ...composedPageRoutes];
  return packages.flatMap(
  ({ packageName, rootPaths, definition, helpBaseUrl, domains, topNav, leftNav }) => {
    const pageRoutes = packagePageRoutes(packageName, rootPaths, definition, helpBaseUrl);
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

export const composedApiModules: VoyzuApiModule[] = packages.flatMap(
  ({ definition }) => [...definition.modules] as VoyzuApiModule[],
);
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

export function hasComposedPackageLeftNavHeader(packageName: string, pathname: string) {
  const registration = headers[packageName];
  return registration?.rootPaths.some((rootPath) => matchesRootPath(pathname, rootPath)) === true;
}

export function ComposedPackageLeftNavHeader({
  packageName,
  isCollapsed,
}: VoyzuSurfaceLeftNavHeaderProps & { packageName: string }) {
  const registration = headers[packageName];
  return registration ? <registration.Header isCollapsed={isCollapsed} /> : null;
}
`;
}

async function writeGeneratedComposition(packages) {
  await mkdir(generatedCompositionRoot, { recursive: true });
  await Promise.all([
    writeFile(
      join(generatedCompositionRoot, "packages.generated.ts"),
      generatedSurfaceRegistry(packages),
      "utf8",
    ),
    writeFile(
      join(generatedCompositionRoot, "package-left-nav-headers.generated.tsx"),
      generatedLeftNavHeaders(packages),
      "utf8",
    ),
  ]);
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
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

  if (cliOptions.emptyIfMissing) {
    const compositionPath = join(
      generatedCompositionRoot,
      "packages.generated.ts",
    );
    const leftNavHeadersPath = join(
      generatedCompositionRoot,
      "package-left-nav-headers.generated.tsx",
    );
    if (!(await pathExists(compositionPath))) {
      await writeGeneratedComposition([]);
      console.log("Created empty Voyzu package composition.");
    } else if (!(await pathExists(leftNavHeadersPath))) {
      await writeFile(
        leftNavHeadersPath,
        generatedLeftNavHeaders([]),
        "utf8",
      );
      console.log("Created empty Voyzu package left-nav header composition.");
    }
    return;
  }

  const packages = await discoverPackages(cliOptions.packages);

  const previousPackageNames = await updateWorkspaceMetadata(packages);
  await syncPackagePublicAssets(packages, previousPackageNames);
  await updateNextConfig(packages);
  await updateTypeScriptConfig();
  await writeGeneratedComposition(packages);
  await clearNextCache();

  console.log("Installing composed workspace dependencies...");
  await run("npm", ["install"], { cwd: workspaceRoot });
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
