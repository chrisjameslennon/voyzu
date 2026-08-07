#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { config } from "dotenv";
import { Pool } from "pg";

const RUNTIME_TOOLS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_RUNNER = join(RUNTIME_TOOLS_ROOT, "src", "package-runner.ts");
const RUNNER_LOADER = join(RUNTIME_TOOLS_ROOT, "src", "register-runner-loader.mjs");
const RUNNER_LOADER_URL = pathToFileURL(RUNNER_LOADER).href;
const COMPOSER = join(RUNTIME_TOOLS_ROOT, "compose", "voyzu-compose.mjs");
const execFileAsync = promisify(execFile);

// Platform initialization is intentionally explicit. Foundation owns the
// shared database primitives required by the other preinstalled packages.
// Any new preinstalled package must be placed deliberately in this sequence.
const PREINSTALLED_PACKAGE_ORDER = Object.freeze([
  "@voyzu/foundation",
  "@voyzu/auth",
  "@voyzu/package-management",
  "@voyzu/system-info",
  "@voyzu/audit",
  "@voyzu/welcome",
  "@voyzu/ui-reference",
  "@voyzu/api-reference",
]);

function printHelp() {
  console.log(`Voyzu package commands

Usage:
  npm run voyzu:add-repo -- <git-address>
  npm run voyzu:install -- <git-address> <npm-package-name>
  npm run voyzu:update
  npm run voyzu:update-repos
  npm run voyzu:update-repo -- <repo-name>
  npm run voyzu:initialize
  npm run voyzu:install-package -- <npm-package-name> [...]
  npm run voyzu:uninstall-package -- <npm-package-name>
  npm run voyzu:list-packages
  npm run voyzu:link-package -- <npm-package-name>
  npm run voyzu:link-packages
  npm run voyzu:compose
  npm run voyzu:run-script -- <npm-package-name> <script-name> [parameters...]

Commands:
  add repo     Add a shallow-cloned package repository to .package-sources
  install      Download or refresh a repository and install one package from it
  update       Fast-forward Voyzu, recompose packages, and build in production
  update-repos  Fast-forward every cloned package repository
  update repo   Fast-forward one cloned package repository
  initialize   Initialize the preinstalled Voyzu platform database
  install-package  Copy packages from downloaded source repositories
  uninstall-package  Remove one installed package and its database objects
  list-packages  List packages installed in the Voyzu runtime
  link-package  Install one local package as a watched development copy
  link-packages  Install all local packages as watched development copies
  compose      Regenerate the application package registration
  run-script   Execute a script exported by an installed package manifest

`);
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
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

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

async function findInstance(start = process.cwd()) {
  let current = resolve(start);

  while (true) {
    const workspaceRoot = join(current, ".run");
    if (await pathExists(join(workspaceRoot, "package.json"))) {
      const workspacePackage = await readJson(join(workspaceRoot, "package.json"));
      const mode = workspacePackage.voyzu?.mode;
      if (!["development", "production"].includes(mode)) {
        throw new Error(
          `The .run workspace must declare voyzu.mode as development or production.`,
        );
      }
      return {
        instanceRoot: current,
        workspaceRoot,
        platformRoot: join(workspaceRoot, "voyzu"),
        mode,
      };
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  current = resolve(start);
  while (true) {
    const manifestPath = join(current, "package.json");
    if (await pathExists(manifestPath)) {
      const manifest = await readJson(manifestPath);
      if (manifest.name === "voyzu" && await pathExists(join(current, "apps", "web"))) {
        return {
          instanceRoot: current,
          workspaceRoot: current,
          platformRoot: current,
          mode: "source",
        };
      }
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error(
    "This command must run inside a Voyzu installation, package-development repository, or Voyzu source repository.",
  );
}

function repositoryName(repository) {
  const withoutQuery = repository.replace(/[?#].*$/, "");
  const name = basename(withoutQuery.replace(/[\\/]$/, "")).replace(/\.git$/i, "");
  if (!name || name === "." || name === "..") {
    throw new Error(`Could not determine a repository name from: ${repository}`);
  }
  return name;
}

function packagePathParts(packageName) {
  if (
    typeof packageName !== "string"
    || packageName.length === 0
    || packageName.includes("\\")
    || packageName.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error(`Invalid npm package name: ${packageName}`);
  }

  const parts = packageName.split("/");
  if (
    parts.length !== 2
    || !parts[0].startsWith("@")
    || parts[0].length === 1
  ) {
    throw new Error(
      `Invalid Voyzu package name: ${packageName}. Package names must use @publisher/package-name.`,
    );
  }
  return parts;
}

function normalizeRepositoryUrl(repository) {
  if (typeof repository !== "string" || repository.trim().length === 0) {
    throw new Error("package.json repository must be a non-empty URL string.");
  }

  let normalized = repository.trim().replace(/^git\+/, "");
  const githubShortcut = normalized.match(/^github:([^/]+\/.+)$/i);
  if (githubShortcut) normalized = `https://github.com/${githubShortcut[1]}`;
  const githubSsh = normalized.match(/^git@github\.com:(.+)$/i);
  if (githubSsh) normalized = `https://github.com/${githubSsh[1]}`;
  normalized = normalized
    .replace(/^ssh:\/\/git@github\.com\//i, "https://github.com/")
    .replace(/[?#].*$/, "")
    .replace(/[\\/]$/, "")
    .replace(/\.git$/i, "");
  return normalized.toLowerCase();
}

async function actualRepositoryUrl(directory) {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["-C", directory, "config", "--get", "remote.origin.url"],
      { encoding: "utf8" },
    );
    const repository = stdout.trim();
    if (!repository) throw new Error("remote.origin.url is empty");
    return repository;
  } catch {
    throw new Error(
      `Cannot determine the Git repository containing ${directory}. Packages must be installed from a Git checkout with an origin remote.`,
    );
  }
}

async function validateInstallablePackageManifest(manifest, directory) {
  const packageName = manifest.name || directory;
  let declaredRepository;
  try {
    declaredRepository = normalizeRepositoryUrl(manifest.repository);
  } catch {
    throw new Error(`${packageName} package.json repository must be a non-empty URL string.`);
  }
  const actualRepository = await actualRepositoryUrl(directory);
  if (declaredRepository !== normalizeRepositoryUrl(actualRepository)) {
    throw new Error(
      `${packageName} declares repository ${manifest.repository}, but its Git checkout origin is ${actualRepository}.`,
    );
  }
  if (manifest.voyzu?.allowInstall !== true) {
    throw new Error(`${packageName} cannot be installed because voyzu.allowInstall is not true.`);
  }
  if (
    !Array.isArray(manifest.voyzu.dependencies)
    || manifest.voyzu.dependencies.some((name) => typeof name !== "string" || name.length === 0)
  ) {
    throw new Error(`${packageName} voyzu.dependencies must be an array of package names.`);
  }
  if (
    !Array.isArray(manifest.voyzu.rootPaths)
    || manifest.voyzu.rootPaths.some((rootPath) =>
      typeof rootPath !== "string"
      || !rootPath.startsWith("/")
      || (rootPath.length > 1 && rootPath.endsWith("/"))
    )
  ) {
    throw new Error(`${packageName} voyzu.rootPaths must be an array of absolute paths without trailing slashes.`);
  }
}

async function repositoryDirectories(instanceRoot) {
  const repositoriesRoot = join(instanceRoot, ".package-sources");
  await mkdir(repositoriesRoot, { recursive: true });
  return {
    repositoriesRoot,
    entries: (await readdir(repositoriesRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

async function cloneRepository(instanceRoot, repository) {
  if (!repository) {
    throw new Error("Usage: npm run voyzu:add-repo -- <git-address>");
  }

  const { repositoriesRoot } = await repositoryDirectories(instanceRoot);
  const name = repositoryName(repository);
  const target = join(repositoriesRoot, name);
  if (await pathExists(target)) {
    throw new Error(
      `Package repository already exists: ${target}. Use "npm run voyzu:update-repo -- ${name}" to update it.`,
    );
  }

  console.log(`Cloning ${repository}...`);
  await run("git", ["clone", "--depth", "1", repository, target]);
  console.log(`Package source repository ready: .package-sources/${name}`);
}

async function downloadOrRefreshRepository(instanceRoot, repository) {
  const { repositoriesRoot } = await repositoryDirectories(instanceRoot);
  const name = repositoryName(repository);
  const target = join(repositoriesRoot, name);

  if (!(await pathExists(target))) {
    await cloneRepository(instanceRoot, repository);
    return;
  }

  if (!(await pathExists(join(target, ".git")))) {
    throw new Error(
      `Package repository directory is not a Git checkout: ${target}`,
    );
  }

  await pullRepository(target, name);
}

async function pullRepository(directory, label) {
  if (!(await pathExists(join(directory, ".git")))) {
    console.warn(`Skipping ${label}: it is not a Git checkout.`);
    return;
  }
  console.log(`Refreshing ${label}...`);
  await run("git", ["pull", "--ff-only"], { cwd: directory });
}

async function pullRepositories(instanceRoot) {
  const { repositoriesRoot, entries } = await repositoryDirectories(instanceRoot);
  if (entries.length === 0) {
    console.log("No package repositories are cloned.");
    return;
  }
  for (const entry of entries) {
    await pullRepository(join(repositoriesRoot, entry.name), entry.name);
  }
}

async function pullNamedRepository(instanceRoot, name) {
  if (!name) throw new Error("Usage: npm run voyzu:update-repo -- <repo-name>");
  const { repositoriesRoot } = await repositoryDirectories(instanceRoot);
  const directory = join(repositoriesRoot, name);
  if (!(await pathExists(directory))) {
    throw new Error(`Package source repository was not found: .package-sources/${name}`);
  }
  await pullRepository(directory, name);
}

async function refreshVoyzu(context) {
  const platformDirectory = context.platformRoot;
  if (!(await pathExists(join(platformDirectory, ".git")))) {
    throw new Error(
      `Voyzu source is not a Git checkout and cannot be refreshed: ${platformDirectory}`,
    );
  }

  const { stdout: platformBranch } = await execFileAsync(
    "git",
    ["branch", "--show-current"],
    { cwd: platformDirectory, encoding: "utf8" },
  );
  if (platformBranch.trim() !== "main") {
    throw new Error(
      `Voyzu platform updates are supported only from the main branch. Current branch: ${platformBranch.trim() || "detached HEAD"}.`,
    );
  }

  // Composition deliberately changes these tracked platform files and writes
  // generated API documentation. They are disposable runtime output; any
  // other platform edit remains protected and prevents refresh.
  const generatedRuntimePaths = [
    "apps/web/app/generated-files",
    "apps/web/next.config.ts",
    "apps/web/package.json",
    "apps/web/public/voyzu/openapi.json",
  ];
  await run(
    "git",
    ["restore", "--staged", "--worktree", "--", ...generatedRuntimePaths],
    { cwd: platformDirectory },
  );
  await run(
    "git",
    ["clean", "-fd", "--", "apps/web/app/generated-files"],
    { cwd: platformDirectory },
  );
  // Scoped public directories are package-owned composition artifacts.
  await run(
    "git",
    ["clean", "-fd", "--", ":(glob)apps/web/public/@*/**"],
    { cwd: platformDirectory },
  );
  const { stdout: platformStatus } = await execFileAsync(
    "git",
    ["status", "--porcelain"],
    { cwd: platformDirectory, encoding: "utf8" },
  );
  if (platformStatus.trim()) {
    throw new Error(
      `Voyzu source contains non-generated changes and cannot be refreshed:\n${platformStatus.trim()}`,
    );
  }

  console.log("Refreshing Voyzu...");
  await run("git", ["pull", "--ff-only"], { cwd: platformDirectory });

  if (context.mode === "source") {
    console.log("Installing Voyzu dependencies...");
    await run("npm", ["install", "--package-lock=false"], {
      cwd: context.workspaceRoot,
    });

    console.log("Building Voyzu...");
    await run("npm", ["run", "build"], { cwd: platformDirectory });
  } else {
    console.log("Recomposing the Voyzu runtime...");
    await compose(context);

    if (context.mode === "production") {
      console.log("Building Voyzu...");
      await run("npm", ["run", "build"], { cwd: platformDirectory });
    }
  }

  console.log(
    "Restart the Voyzu web server for the platform changes to take effect.",
  );
}

async function discoverPackageWorkspace(packagesRoot, sourceLabel) {
  if (!(await pathExists(packagesRoot))) return [];

  const packages = [];
  const scopes = (await readdir(packagesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("@"))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const scope of scopes) {
    const scopeRoot = join(packagesRoot, scope.name);
    const entries = (await readdir(scopeRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const directory = join(scopeRoot, entry.name);
      const manifestPath = join(directory, "package.json");
      if (!(await pathExists(manifestPath))) {
        console.warn(`Skipping ${directory}: no package.json.`);
        continue;
      }

      const manifest = await readJson(manifestPath);
      if (manifest.voyzu?.["voyzu-package"] !== true) {
        console.warn(
          `Skipping ${manifest.name || directory} from ${sourceLabel}: voyzu.voyzu-package is not true.`,
        );
        continue;
      }

      const expectedName = `${scope.name}/${entry.name}`;
      if (manifest.name !== expectedName) {
        throw new Error(
          `Package directory ${relative(packagesRoot, directory)} declares ${manifest.name || "no package name"}. Expected ${expectedName}.`,
        );
      }
      packagePathParts(manifest.name);

      packages.push({
        name: manifest.name,
        directory,
        repository: sourceLabel,
        manifest,
      });
    }
  }
  return packages;
}

async function discoverLocalSourcePackages(context) {
  return discoverPackageWorkspace(
    join(context.instanceRoot, "packages"),
    "local packages workspace",
  );
}

async function listInstalledPackages(context) {
  const installedRoot = join(context.workspaceRoot, "packages");
  if (!(await pathExists(installedRoot))) {
    console.log("No Voyzu packages are installed.");
    return;
  }

  const installed = [];
  const scopes = (await readdir(installedRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("@"))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const scope of scopes) {
    const scopeRoot = join(installedRoot, scope.name);
    const entries = (await readdir(scopeRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const directory = join(scopeRoot, entry.name);
      const manifestPath = join(directory, "package.json");
      if (!(await pathExists(manifestPath))) continue;

      const manifest = await readJson(manifestPath);
      if (manifest.voyzu?.["voyzu-package"] !== true) continue;

      const expectedName = `${scope.name}/${entry.name}`;
      if (manifest.name !== expectedName) {
        throw new Error(
          `Installed package directory ${relative(installedRoot, directory)} declares ${manifest.name || "no package name"}. Expected ${expectedName}.`,
        );
      }

      installed.push({
        name: manifest.name,
        version: manifest.version,
      });
    }
  }

  if (installed.length === 0) {
    console.log("No Voyzu packages are installed.");
    return;
  }

  installed.sort((left, right) => left.name.localeCompare(right.name));
  console.log("Installed Voyzu packages:");
  for (const packageInfo of installed) {
    const version = packageInfo.version ? ` ${packageInfo.version}` : "";
    console.log(`  ${packageInfo.name}${version} (copied)`);
  }
}

async function discoverRepositorySourcePackages(context) {
  const { instanceRoot } = context;
  const { repositoriesRoot, entries } = await repositoryDirectories(instanceRoot);
  const packages = [];
  for (const entry of entries) {
    packages.push(
      ...await discoverPackageWorkspace(
        join(repositoriesRoot, entry.name, "packages"),
        entry.name,
      ),
    );
  }
  return packages;
}

function copyFilter(sourceRoot, source) {
  const child = relative(sourceRoot, source);
  if (!child) return true;
  return !child.split(/[\\/]/).some((part) =>
    part === "node_modules"
    || part === ".git"
    || part === ".dev"
    || part === ".run"
    || part === ".next"
    || part === ".turbo"
    || part === "build"
    || part === "coverage"
    || part === "dist"
  );
}

async function runPackageRunner(context, action, packageDirectory, extraArgs = []) {
  await run(
    process.execPath,
    [
      "--import",
      RUNNER_LOADER_URL,
      "--import",
      "tsx",
      PACKAGE_RUNNER,
      action,
      context.instanceRoot,
      packageDirectory,
      ...extraArgs,
    ],
    {
      cwd: context.workspaceRoot,
      env: {
        ...process.env,
        TSX_TSCONFIG_PATH: join(
          context.platformRoot,
          "tsconfig.json",
        ),
        VOYZU_PLATFORM_ROOT: context.platformRoot,
        VOYZU_WORKSPACE_ROOT: context.workspaceRoot,
      },
    },
  );
}

async function installPreinstalledPackages(context) {
  const platformPackagesRoot = join(
    context.platformRoot,
    "packages",
    "@voyzu",
  );
  const packagesByName = new Map();

  for (const entry of await readdir(platformPackagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(platformPackagesRoot, entry.name);
    const manifestPath = join(directory, "package.json");
    if (!(await pathExists(manifestPath))) continue;
    const manifest = await readJson(manifestPath);
    if (manifest.voyzu?.preinstalled !== true) continue;
    if (
      manifest.voyzu?.["voyzu-package"] !== true
      || manifest.voyzu?.allowInstall !== true
    ) {
      throw new Error(
        `Preinstalled package ${manifest.name || entry.name} must declare installable Voyzu package metadata.`,
      );
    }
    if (typeof manifest.name !== "string" || manifest.name.length === 0) {
      throw new Error(
        `Preinstalled package directory ${entry.name} does not declare a package name.`,
      );
    }
    if (!(await pathExists(join(directory, "voyzu.package.ts")))) {
      throw new Error(
        `Preinstalled package ${manifest.name} does not contain voyzu.package.ts.`,
      );
    }
    await validateInstallablePackageManifest(manifest, directory);
    if (packagesByName.has(manifest.name)) {
      throw new Error(`Duplicate preinstalled package ${manifest.name}.`);
    }
    packagesByName.set(manifest.name, {
      name: manifest.name,
      directory,
    });
  }

  const undeclaredPackages = [...packagesByName.keys()].filter(
    (name) => !PREINSTALLED_PACKAGE_ORDER.includes(name),
  );
  if (undeclaredPackages.length > 0) {
    throw new Error(
      `Preinstalled package order is not defined for: ${undeclaredPackages.join(", ")}. Update PREINSTALLED_PACKAGE_ORDER before initializing Voyzu.`,
    );
  }

  const missingPackages = PREINSTALLED_PACKAGE_ORDER.filter(
    (name) => !packagesByName.has(name),
  );
  if (missingPackages.length > 0) {
    throw new Error(
      `Required preinstalled packages are missing: ${missingPackages.join(", ")}.`,
    );
  }

  for (const packageName of PREINSTALLED_PACKAGE_ORDER) {
    const packageInfo = packagesByName.get(packageName);
    console.log(`Applying preinstalled ${packageInfo.name} database installation...`);
    await runPackageRunner(context, "install", packageInfo.directory);
  }

  const packageManagement = packagesByName.get("@voyzu/package-management");
  console.log("Reconciling the installed package inventory...");
  await runPackageRunner(context, "run", packageManagement.directory, ["refresh"]);
}

async function assertVoyzuInitialized(context) {
  config({
    path: resolve(context.instanceRoot, ".env.local"),
    quiet: true,
  });
  const databaseUrl = process.env.VOYZU_DATABASE_URL;
  if (
    !databaseUrl
    || databaseUrl.includes("<")
    || databaseUrl.includes(">")
    || databaseUrl.includes("CHANGE_ME")
  ) {
    throw new Error(
      "Set VOYZU_DATABASE_URL in .env.local before installing packages.",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const result = await pool.query(
      "SELECT to_regclass('public.app_user') IS NOT NULL AS initialized",
    );
    if (result.rows[0]?.initialized !== true) {
      throw new Error(
        "Voyzu has not been initialized. Run \"npm run voyzu:initialize\" first.",
      );
    }
  } finally {
    await pool.end();
  }
}

async function compose(context) {
  const { workspaceRoot } = context;
  await run(
    process.execPath,
    [
      COMPOSER,
      "--packages-root",
      join(workspaceRoot, "packages"),
      "--runtime",
      context.platformRoot,
      "--workspace",
      workspaceRoot,
    ],
    { cwd: context.instanceRoot },
  );
}

async function installPackages(
  context,
  requestedNames,
  { source, allSourcePackages = false },
) {
  console.log("Discovering Voyzu packages...");
  const discovered = source === "local"
    ? await discoverLocalSourcePackages(context)
    : await discoverRepositorySourcePackages(context);
  const names = allSourcePackages
    ? discovered.map((sourcePackage) => sourcePackage.name)
    : requestedNames;
  if (names.length === 0) {
    throw new Error(
      allSourcePackages
        ? "No installable local Voyzu packages were found."
        : "No package was specified.",
    );
  }
  names.forEach(packagePathParts);

  const byName = new Map();
  for (const sourcePackage of discovered) {
    const existing = byName.get(sourcePackage.name);
    if (existing) {
      throw new Error(
        `Package ${sourcePackage.name} exists in both ${existing.repository} and ${sourcePackage.repository}.`,
      );
    }
    byName.set(sourcePackage.name, sourcePackage);
  }

  const selected = names.map((name) => {
    const sourcePackage = byName.get(name);
    if (!sourcePackage) {
      if (source === "local") {
        throw new Error(
          `Local Voyzu package not found: ${name}. Development packages must be beneath ${join(context.instanceRoot, "packages")}.`,
        );
      }
      throw new Error(
        `Voyzu package not found in a downloaded repository: ${name}. Add its repository first with "npm run voyzu:add-repo -- <git-address>".`,
      );
    }
    return sourcePackage;
  });

  for (const sourcePackage of selected) {
    await validateInstallablePackageManifest(sourcePackage.manifest, sourcePackage.directory);
  }

  const installedRoot = join(context.workspaceRoot, "packages");
  await mkdir(installedRoot, { recursive: true });
  const installed = [];

  for (const sourcePackage of selected) {
    const manifestPath = join(sourcePackage.directory, "voyzu.package.ts");
    if (!(await pathExists(manifestPath))) {
      throw new Error(`${sourcePackage.name} does not contain voyzu.package.ts.`);
    }

    const target = join(installedRoot, ...packagePathParts(sourcePackage.name));
    const relativeTarget = relative(installedRoot, target);
    if (relativeTarget.startsWith("..") || relativeTarget.split(sep).includes("..")) {
      throw new Error(`Unsafe package installation path: ${target}`);
    }

    console.log(`Installing ${sourcePackage.name} from ${sourcePackage.repository}...`);
    await rm(target, { recursive: true, force: true });
    await mkdir(dirname(target), { recursive: true });
    await cp(sourcePackage.directory, target, {
      recursive: true,
      filter: (source) => copyFilter(sourcePackage.directory, source),
    });
    console.log(`  copied to ${target}`);
    installed.push({ name: sourcePackage.name, directory: target });
  }

  console.log("Installing runtime workspace dependencies...");
  await run("npm", ["install"], { cwd: context.workspaceRoot });

  for (const packageInfo of installed) {
    console.log(`Applying ${packageInfo.name} database installation...`);
    await runPackageRunner(context, "install", packageInfo.directory);
  }

  await compose(context);
  console.log(
    `Installed ${installed.length} Voyzu package${installed.length === 1 ? "" : "s"}.`,
  );
}

async function uninstallPackage(context, packageName) {
  packagePathParts(packageName);

  const nextDirectory = join(
    context.platformRoot,
    "apps",
    "web",
    ".next",
  );
  const nextLockPaths = [
    join(nextDirectory, "lock"),
    join(nextDirectory, "dev", "lock"),
  ];
  const activeNextLockPaths = [];
  for (const nextLockPath of nextLockPaths) {
    if (await pathExists(nextLockPath)) activeNextLockPaths.push(nextLockPath);
  }
  if (activeNextLockPaths.length > 0) {
    throw new Error(
      `The Next.js runtime is active. Stop it before uninstalling packages (${activeNextLockPaths.join(", ")}).`,
    );
  }

  const installedRoot = join(context.workspaceRoot, "packages");
  const packageDirectory = join(installedRoot, ...packagePathParts(packageName));
  const manifestPath = join(packageDirectory, "package.json");

  if (!(await pathExists(manifestPath))) {
    const platformManifestPath = join(
      context.platformRoot,
      "packages",
      ...packagePathParts(packageName),
      "package.json",
    );
    if (await pathExists(platformManifestPath)) {
      const platformManifest = await readJson(platformManifestPath);
      if (platformManifest.voyzu?.preinstalled === true) {
        throw new Error(`Preinstalled platform package ${packageName} cannot be uninstalled.`);
      }
    }
    throw new Error(`Package is not installed: ${packageName}`);
  }

  const manifest = await readJson(manifestPath);
  if (manifest.name !== packageName) {
    throw new Error(
      `Installed package directory for ${packageName} declares ${manifest.name || "no package name"}.`,
    );
  }
  if (manifest.voyzu?.preinstalled === true) {
    throw new Error(`Preinstalled platform package ${packageName} cannot be uninstalled.`);
  }
  if (!(await pathExists(join(packageDirectory, "voyzu.package.ts")))) {
    throw new Error(`${packageName} does not contain voyzu.package.ts.`);
  }

  console.log(`Applying ${packageName} database uninstall...`);
  await runPackageRunner(context, "uninstall", packageDirectory);

  await rm(packageDirectory, { recursive: true, force: true });
  console.log(`Removed ${packageDirectory}`);

  await compose(context);
  console.log(`Uninstalled ${packageName}.`);
}

async function runPackageScript(context, packageName, scriptName, parameters) {
  if (!packageName || !scriptName) {
    throw new Error(
      "Usage: npm run voyzu:run-script -- <npm-package-name> <script-name> [parameters...]",
    );
  }
  let directory = join(
    context.workspaceRoot,
    "packages",
    ...packagePathParts(packageName),
  );
  if (!(await pathExists(join(directory, "package.json")))) {
    directory = join(
      context.platformRoot,
      "packages",
      ...packagePathParts(packageName),
    );
  }
  if (!(await pathExists(join(directory, "package.json")))) {
    throw new Error(`Package is not installed: ${packageName}`);
  }
  await runPackageRunner(context, "run", directory, [scriptName, ...parameters]);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    printHelp();
    return;
  }

  const context = await findInstance();
  const { instanceRoot } = context;
  const [command, subject, ...rest] = args;

  if (command === "add" && subject === "repo") {
    await cloneRepository(instanceRoot, rest[0]);
    return;
  }
  if (command === "install") {
    const repository = subject;
    const packageName = rest[0];
    if (!repository || !packageName) {
      throw new Error(
        "Usage: npm run voyzu:install -- <git-address> <npm-package-name>",
      );
    }
    await assertVoyzuInitialized(context);
    await downloadOrRefreshRepository(instanceRoot, repository);
    await installPackages(
      context,
      [packageName],
      { source: "repositories" },
    );
    console.log(
      "Restart the Voyzu web server for the installation changes to take effect.",
    );
    return;
  }
  if (command === "update-repos") {
    await pullRepositories(instanceRoot);
    return;
  }
  if (command === "update" && !subject) {
    await refreshVoyzu(context);
    return;
  }
  if (command === "update" && subject === "repo") {
    await pullNamedRepository(instanceRoot, rest[0]);
    return;
  }
  if (command === "initialize") {
    await installPreinstalledPackages(context);
    console.log("Voyzu platform initialized.");
    return;
  }
  if (command === "install-package") {
    await assertVoyzuInitialized(context);
    const packageNames = args.slice(1);
    if (packageNames.length === 0) {
      throw new Error(
        "Usage: npm run voyzu:install-package -- <npm-package-name> [...]",
      );
    }
    const option = packageNames.find((argument) => argument.startsWith("--"));
    if (option) {
      throw new Error(
        `voyzu:install-package does not accept ${option}; packages are always copied from .package-sources.`,
      );
    }
    await installPackages(
      context,
      packageNames,
      { source: "repositories" },
    );
    return;
  }
  if (command === "uninstall-package") {
    if (!subject || rest.length > 0) {
      throw new Error(
        "Usage: npm run voyzu:uninstall-package -- <npm-package-name>",
      );
    }
    await assertVoyzuInitialized(context);
    await uninstallPackage(context, subject);
    return;
  }
  if (command === "list-packages") {
    if (subject) {
      throw new Error("Usage: npm run voyzu:list-packages");
    }
    await listInstalledPackages(context);
    return;
  }
  if (command === "link-package") {
    if (context.mode !== "development") {
      throw new Error("voyzu:link-package is only available in a development runtime.");
    }
    if (!subject || args.length !== 2) {
      throw new Error(
        "Usage: npm run voyzu:link-package -- <npm-package-name>",
      );
    }
    await assertVoyzuInitialized(context);
    await installPackages(
      context,
      [subject],
      { source: "local" },
    );
    return;
  }
  if (command === "link-packages") {
    if (context.mode !== "development") {
      throw new Error("voyzu:link-packages is only available in a development runtime.");
    }
    if (subject) {
      throw new Error("Usage: npm run voyzu:link-packages");
    }
    await assertVoyzuInitialized(context);
    await installPackages(
      context,
      [],
      {
        source: "local",
        allSourcePackages: true,
      },
    );
    return;
  }
  if (command === "compose") {
    await compose(context);
    return;
  }
  if (command === "run-script") {
    await runPackageScript(context, subject, rest[0], rest.slice(1));
    return;
  }

  throw new Error("Unknown internal Voyzu package command.");
}

main().catch((error) => {
  console.error("");
  console.error(`Voyzu command failed: ${error.message}`);
  process.exitCode = 1;
});
