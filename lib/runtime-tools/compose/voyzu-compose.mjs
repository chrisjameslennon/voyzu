#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createScanner } from "typescript/unstable/ast/scanner";
import { SyntaxKind } from "typescript/unstable/ast";
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
import { pathToFileURL } from "node:url";
import "tsx/esm";
const tsImport = (specifier) => import(specifier);
import "../src/register-runner-loader.mjs";
import { validateUiSurfaces } from "../../ui-surface/src/contributions.ts";
import { validatePageRouting, pagePattern } from "../../ui-surface/src/page-routing.ts";

function printHelp() {
  console.log(`Usage:
  voyzu-compose --packages-root <directory> [options]

Options:
  --packages-root <path>  Installed Voyzu package root.
  --runtime <path>        Voyzu platform root. Defaults to the current directory.
  --workspace <path>      npm workspace root. Defaults to the runtime root.
  --package <name>        Package to compose. Repeat to select multiple packages.
  --no-install            Regenerate composition without running npm install.
  --routing-only         Refresh HTTP API, page/navigation registries and HTTP documentation only.
  --accept-missing-implementations  Allow internal API definitions without core implementations.
  --help                  Show this help.
`);
}

function parseArgs(args) {
  const options = {
    packagesRoot: undefined,
    packages: [],
    runtime: process.cwd(),
    workspace: undefined,
    noInstall: false,
    routingOnly: false,
    acceptMissingImplementations: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (argument === "--packages-root") {
      options.packagesRoot = args[++index];
    } else if (argument === "--package") {
      options.packages.push(args[++index]);
    } else if (argument === "--runtime") {
      options.runtime = args[++index];
    } else if (argument === "--workspace") {
      options.workspace = args[++index];
    } else if (argument === "--no-install") {
      options.noInstall = true;
    } else if (argument === "--routing-only") {
      options.routingOnly = true;
    } else if (argument === "--accept-missing-implementations") {
      options.acceptMissingImplementations = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (options.help) return options;
  if (!options.packagesRoot) {
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
  : undefined;
const webRoot = join(runtimeRoot, "apps", "web");
const generatedHttpApiRoutesRoot = join(webRoot, ".generated", "http-api-routes");
const generatedPageRoutesRoot = join(webRoot, ".generated", "page-routes");
const generatedNavigationRoot = join(webRoot, ".generated", "navigation");
const generatedRoutesRoot = join(webRoot, "app", "(generated)");
const composingPlatformPackages = packagesRoot === join(runtimeRoot, "packages");

const PRE_INSTALLED_NAVIGATION_ORDER = [
  "@voyzu/welcome",
  "@voyzu/ui-reference",
  "@voyzu/http-api-reference",
  "@voyzu/auth",
  "@voyzu/localization",
  "@voyzu/package-management",
  "@voyzu/system-info",
  "@voyzu/audit",
  "@voyzu/party",
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

function exportedModules(manifest, suffix) {
  return Object.keys(manifest.exports ?? {}).flatMap((exportName) => {
    // Public code exports are not module registration entry points.
    if (exportName.startsWith("./exports/")) return [];
    const match = exportName.match(new RegExp(`^\\./([^/]+)/${suffix}$`));
    return match ? [match[1]] : [];
  });
}

async function packageDescriptor(manifest, directory, root, source) {
  const manifestPath = join(directory, "package.json");
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
  const { default: definition } = await tsImport(pathToFileURL(join(directory, "voyzu.package.ts")).href, import.meta.url);
  const pageRouting = definition.contracts?.pageRouting;
  validatePageRouting(manifest.name, pageRouting);
  const httpApiRoots = definition.contracts?.httpApiRouting?.roots ?? [];
  validateRootPaths(manifest.name, "httpApiRouting.roots", httpApiRoots);
  const helpBaseUrl = manifest.voyzu.settings?.helpBaseUrl;
  if (
    helpBaseUrl !== undefined
    && (typeof helpBaseUrl !== "string" || helpBaseUrl.trim().length === 0)
  ) {
    throw new Error(`${manifest.name} voyzu.settings.helpBaseUrl must be a non-empty string.`);
  }
  const packagePath = relative(root, directory).replaceAll("\\", "/");
  const packagePathParts = packagePath.split("/");
  if (
    packagePathParts.length !== 2
    || !packagePathParts[0].startsWith("@")
    || manifest.name !== packagePath
  ) {
    throw new Error(
      `${source} package directory ${packagePath} declares ${manifest.name}. Expected a matching @publisher/package-name.`,
    );
  }
  if (!(await pathExists(join(directory, "voyzu.package.ts")))) {
    throw new Error(`${manifest.name} does not contain voyzu.package.ts.`);
  }
  if (!hasExport(manifest, "./voyzu-package")) {
    throw new Error(`${manifest.name} must export ./voyzu-package.`);
  }

  const descriptor = {
    name: manifest.name,
    source,
    directory,
    workspace: relative(workspaceRoot, directory).replaceAll("\\", "/"),
    uiSurface: definition.contracts?.uiSurface ?? {},
    pageRouting,

    helpBaseUrl,
    pageRootPaths: Object.keys(pageRouting?.roots ?? {}),
    httpApiRootPaths: httpApiRoots,
  };
  return descriptor;
}

async function discoverPackages(selectedPackageNames) {
  const selected = selectedPackageNames.length ? new Set(selectedPackageNames) : undefined;
  const packages = [];

  for (const directory of await candidatePackageDirectories(packagesRoot)) {
    const manifestPath = join(directory, "package.json");
    if (!(await pathExists(manifestPath))) {
      console.warn(`Skipping ${directory}: no package.json.`);
      continue;
    }
    const manifest = await readJson(manifestPath);
    if (manifest.voyzu?.["voyzu-package"] !== true) {
      console.warn(`Skipping ${manifest.name || directory}: voyzu.voyzu-package is not true.`);
      continue;
    }
    if (manifest.voyzu.preinstalled === true) {
      if (composingPlatformPackages) continue;
      throw new Error(`Installed package ${manifest.name} cannot declare voyzu.preinstalled.`);
    }
    if (selected && !selected.has(manifest.name)) continue;
    packages.push(await packageDescriptor(manifest, directory, packagesRoot, "installed"));
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

async function discoverPreInstalledPackages() {
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
    packages.push(
      await packageDescriptor(manifest, directory, platformPackagesRoot, "pre-installed"),
    );
  }
  return packages;
}

async function validatePackageSurfaces(packages, label) {
  const routes = packages.flatMap(item => Object.entries(item.pageRouting?.roots ?? {}).flatMap(([rootPath, root]) => Object.entries(root.routes).map(([id, route]) => ({ ...route, id, rootPath, packageName: item.name }))));
  const ids = new Set(), patterns = new Set();
  for (const route of routes) {
    if (ids.has(route.id)) throw new Error('Duplicate ' + label + ' page route ID: ' + route.id);
    if (patterns.has(pagePattern(route.path))) throw new Error('Duplicate ' + label + ' page path: ' + route.path);
    ids.add(route.id); patterns.add(pagePattern(route.path));
  }
  validateUiSurfaces(packages.map(item => ({ packageName: item.name, roots: item.pageRootPaths, surface: item.uiSurface })), routes);
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
      for (const property of ["pageRootPaths", "httpApiRootPaths"]) {
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

function generatedPageRoutes(packages, exportPrefix) {
  const imports = packages.map((item, index) =>
    'import package' + index + ' from ' + JSON.stringify(item.name + '/voyzu-package') + ';');
  const entries = packages.map((item, index) =>
    '  { packageName: ' + JSON.stringify(item.name) + ', helpBaseUrl: ' + JSON.stringify(item.helpBaseUrl ?? null) + ', definition: package' + index + ' },');
  return '// Generated by voyzu compose. Do not edit.\n'
    + 'import type { PackageContracts } from "@voyzu/types/contracts";\n'
    + 'import type { RegisteredPageRoute } from "@voyzu/types/page-routing";\n'
    + 'import documentationGroups from "../http-api-routes/documentation-groups.json";\n'
    + imports.join('\n') + '\n'
    + 'const packages: { packageName: string; helpBaseUrl: string | null; definition: { contracts?: PackageContracts } }[] = [\n' + entries.join('\n') + '\n];\n'
    + 'export const ' + exportPrefix + 'PageRoutes: RegisteredPageRoute[] = packages.flatMap(({ packageName, helpBaseUrl, definition }) =>\n'
    + '  Object.entries(definition.contracts?.pageRouting?.roots ?? {}).flatMap(([rootPath, root]) => Object.entries(root.routes).map(([id, route]) => ({\n'
    + '    ...route, id, rootPath, packageName, helpBaseUrl: helpBaseUrl ?? undefined,\n'
    + '    httpApiDocsUrl: route.httpApiDocumentationGroupId ? (documentationGroups as Record<string, string>)[route.httpApiDocumentationGroupId] : "/http-api-reference",\n'
    + '  }))),\n);\n';
}

function preInstalledNavigationPackages(packages) {
  const order = new Map(
    PRE_INSTALLED_NAVIGATION_ORDER.map((packageName, index) => [packageName, index]),
  );
  return packages
    .filter(({ uiSurface }) => Object.keys(uiSurface).length > 0)
    .sort((left, right) => {
      const leftOrder = order.get(left.name) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.name) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.name.localeCompare(right.name);
    });
}

async function writeGeneratedRegistries(packages, fileName, exportPrefix) {
  await Promise.all([
    mkdir(generatedHttpApiRoutesRoot, { recursive: true }),
    mkdir(generatedPageRoutesRoot, { recursive: true }),
    mkdir(generatedNavigationRoot, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      join(generatedPageRoutesRoot, fileName),
      generatedPageRoutes(packages, exportPrefix),
      "utf8",
    ),
    writeFile(
      join(generatedNavigationRoot, fileName),
      generatedSurfaceRegistry(packages, exportPrefix, fileName),
      "utf8",
    ),
  ]);
}

function generatedSurfaceRegistry(packages, exportPrefix) {
  const selected = packages.some(item => item.source === "pre-installed") ? preInstalledNavigationPackages(packages) : packages;
  const imports = selected.map((item, i) => 'import package' + i + ' from ' + JSON.stringify(item.name + '/voyzu-package') + ';');
  const entries = selected.map((item, i) => '{ packageName: ' + JSON.stringify(item.name) + ', roots: ' + JSON.stringify(item.pageRootPaths) + ', surface: (package' + i + ' as { contracts?: PackageContracts }).contracts?.uiSurface ?? {} }');
  return '// Generated by voyzu compose. Do not edit.\nimport type { PackageContracts } from "@voyzu/types/contracts";\nimport type { SurfaceRegistration } from "@voyzu/ui-surface/contributions";\n' + imports.join('\n') + '\nexport const ' + exportPrefix + 'SurfaceContributions: SurfaceRegistration[] = [' + entries.join(',\n') + '];\n';
}

function generatedLeftNavHeaders(packages) {
  const entries = [];
  for (const item of packages) for (const root of Object.keys(item.uiSurface["leftnav.header"] ?? {})) {
    // Read the authored loader, before tsx adds module-interop wrappers.
    const file = join(item.directory, "voyzu.package.ts");
    const scanner = createScanner(true, undefined, readFileSync(file, "utf8"));
    const tokens = [];
    while (scanner.scan() !== SyntaxKind.EndOfFile) tokens.push({ text: scanner.getTokenText(), value: scanner.getToken() === SyntaxKind.StringLiteral ? scanner.getTokenValue() : scanner.getTokenText() });
    // Find an object property and retain only its initializer tokens.
    const property = (input, name, anyDepth = false) => {
      let depth = 0;
      for (let i = 0; i < input.length; i++) {
        if ((anyDepth || depth === 0) && input[i].value === name && input[i + 1]?.text === ":") {
          let level = 0, end = i + 2;
          for (; end < input.length; end++) {
            const token = input[end].text;
            if (level === 0 && [",", "}"].includes(token)) break;
            if (["{", "(", "["].includes(token)) level++;
            if (["}", ")", "]"].includes(token)) level--;
          }
          return input.slice(i + 2, end);
        }
        if (input[i].text === "{") depth++;
        if (input[i].text === "}") depth--;
      }
      return [];
    };
    const surface = property(tokens, "uiSurface", true);
    const headers = property(surface.slice(1, -1), "leftnav.header");
    const entry = property(headers.slice(1, -1), root);
    const source = property(entry.slice(1, -1), "loadComponent").map(token => token.text).join("");
    const match = /^\(\)=>import\((["'])(\.\/ui-surface\/[^"']+)\1\)\.then\(\(?([A-Za-z_$][\w$]*)\)?=>\3\.([A-Za-z_$][\w$]*)\)$/.exec(source);
    if (!match) throw new Error(item.name + ': header loaders must directly import a component from ./ui-surface/ and select its export with .then(module => module.Component).');
    // Emit only the declared module import; never serialize package code into the browser.
    const specifier = item.name + '/' + match[2].slice(2).replace(/\.tsx?$/, '');
    const key = item.name + ':' + root;
    entries.push(JSON.stringify(key) + ': lazy(() => import(' + JSON.stringify(specifier) + ').then(module => ({ default: module[' + JSON.stringify(match[4]) + '] })))');
  }
  return '"use client";\nimport { lazy, Suspense } from "react";\nimport type { ComponentType } from "react";\nimport type { UiSurfaceHeaderProps } from "@voyzu/types/ui-surface";\nconst headers: Record<string, ComponentType<UiSurfaceHeaderProps>> = {' + entries.join(',\n') + '};\nexport function hasPackageLeftNavHeader(packageName: string, rootPath: string) { return !!headers[packageName + ":" + rootPath]; }\nexport function PackageLeftNavHeader({ packageName, rootPath, presentation }: UiSurfaceHeaderProps & { packageName: string; rootPath: string }) { const Header = headers[packageName + ":" + rootPath]; return Header ? <Suspense fallback={null}><Header presentation={presentation} /></Suspense> : null; }\n';
}

async function writeGeneratedHeaders(packages, fileName) {
  await mkdir(generatedNavigationRoot, { recursive: true });
  await writeFile(
    join(generatedNavigationRoot, fileName),
    generatedLeftNavHeaders(packages),
    "utf8",
  );
}

async function writeGeneratedContracts(packages) {
  await run(process.execPath, [
    "--import", pathToFileURL(join(runtimeRoot, "lib/runtime-tools/src/register-runner-loader.mjs")).href,
    "--import", "tsx",
    join(runtimeRoot, "lib/runtime-tools/compose/compose-internal-api.ts"),
    runtimeRoot, workspaceRoot, JSON.stringify(packages.map(({ name, directory }) => ({ name, directory }))),
    ...(cliOptions.acceptMissingImplementations ? ["--accept-missing-implementations"] : []),
  ], { cwd: workspaceRoot, env: { VOYZU_WORKSPACE_ROOT: workspaceRoot } });
}

async function removeLegacyGeneratedRegistries() {
  await rm(join(webRoot, ".generated", "commands"), { recursive: true, force: true });
  await Promise.all([
    rm(join(webRoot, ".generated", "operations"), { recursive: true, force: true }),
    rm(join(generatedHttpApiRoutesRoot, "index.ts"), { force: true }),
    rm(join(generatedPageRoutesRoot, "index.ts"), { force: true }),
    rm(join(generatedNavigationRoot, "index.ts"), { force: true }),
    rm(join(generatedNavigationRoot, "packages.ts"), { force: true }),
    rm(join(generatedNavigationRoot, "left-nav-headers.tsx"), { force: true }),


  ]);
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

  const preInstalledPackages = await discoverPreInstalledPackages();

  const packages = await discoverPackages(cliOptions.packages);
  const allPackages = [...preInstalledPackages, ...packages];
  assertUniqueRootPaths(allPackages);
  await validatePackageSurfaces(allPackages, "composed");
  await mkdir(generatedPageRoutesRoot, { recursive: true });
  await mkdir(generatedNavigationRoot, { recursive: true });
  await writeJson(join(generatedNavigationRoot, "package-metadata.json"), Object.fromEntries(allPackages.map(item => [item.name, { hasTopNavigation: Object.keys(item.uiSurface["topnav.menu"] ?? {}).length > 0 }])));
  await writeJson(join(generatedPageRoutesRoot, "package-roots.json"), Object.fromEntries(allPackages.map(item => [item.name, item.pageRootPaths])));
  if (!cliOptions.routingOnly) await writeGeneratedContracts(allPackages);
  await run(process.execPath, ["--import", pathToFileURL(join(runtimeRoot, "lib/runtime-tools/src/register-runner-loader.mjs")).href, "--import", "tsx", join(runtimeRoot, "lib/runtime-tools/compose/compose-http-api.ts"), runtimeRoot, JSON.stringify(allPackages.map(({name,directory})=>({name,directory})))], { cwd: workspaceRoot, env: { VOYZU_WORKSPACE_ROOT: workspaceRoot } });

  if (!cliOptions.routingOnly) {
    const previousPackageNames = await updateWorkspaceMetadata(packages);
    await syncPackagePublicAssets(packages, previousPackageNames);
    await updateNextConfig(packages);
    await updateTypeScriptConfig();
  }
  await Promise.all([
    writeGeneratedRegistries(preInstalledPackages, "pre-installed.ts", "preInstalled"),

    writeGeneratedHeaders(preInstalledPackages, "pre-installed-headers.tsx"),
    writeGeneratedRegistries(packages, "installed.ts", "installed"),

    writeGeneratedHeaders(packages, "installed-headers.tsx"),
  ]);
  if (cliOptions.routingOnly) {
    await run(process.execPath, ["--import", pathToFileURL(join(runtimeRoot, "lib/runtime-tools/src/register-runner-loader.mjs")).href, "--import", "tsx", join(runtimeRoot, "packages/@voyzu/http-api-reference/scripts/build-http-api-reference.cli.ts")], { cwd: runtimeRoot, env: { VOYZU_WORKSPACE_ROOT: workspaceRoot } });
    console.log("Routing composition complete.");
    return;
  }
  await removeLegacyGeneratedRegistries();
  await rm(join(runtimeRoot, "generated-composition"), { recursive: true, force: true });
  await rm(generatedRoutesRoot, { recursive: true, force: true });
  await clearNextCache();

  if (cliOptions.noInstall) {
    console.log("Skipping composed workspace dependency installation.");
  } else {
    console.log("Installing composed workspace dependencies...");
    await run("npm", ["install", "--package-lock=false"], {
      cwd: workspaceRoot,
    });
  }
  // A platform-source checkout does not contain the runtime's extension inventory.
  // Reconciling it against a shared database would erase package preferences.
  if (!composingPlatformPackages) {
    console.log("Reconciling the installed package inventory...");
    await run(
      "npm",
      ["run", "voyzu:run-script", "--", "@voyzu/package-management", "refresh"],
      { cwd: runtimeRoot },
    );
  }
  console.log("Building HTTP API Reference...");
  await run("npm", ["run", "voyzu:build-http-api-reference"], { cwd: runtimeRoot });
  console.log(
    `Voyzu composition complete: ${packages.length} package${packages.length === 1 ? "" : "s"}.`,
  );
}

main().catch((error) => {
  console.error("");
  console.error(`Compose failed: ${error.message}`);
  process.exitCode = 1;
});
