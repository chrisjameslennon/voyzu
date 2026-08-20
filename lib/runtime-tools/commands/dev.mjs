#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  access,
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";

import { watch } from "chokidar";

const ignoredDirectoryNames = new Set([
  ".dev",
  ".git",
  ".next",
  ".run",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
  "workspaces",
];

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function findDevelopmentInstance(start = process.cwd()) {
  let current = resolve(start);
  while (true) {
    const workspaceRoot = join(current, ".run");
    const runtimeManifestPath = join(workspaceRoot, "package.json");
    if (await pathExists(runtimeManifestPath)) {
      const instanceManifestPath = join(current, "package.json");
      if (!(await pathExists(instanceManifestPath))) {
        throw new Error("[Voyzu] A development installation must have a root package.json.");
      }
      const instanceManifest = JSON.parse(await readFile(instanceManifestPath, "utf8"));
      if (instanceManifest.voyzu?.mode !== "development") {
        throw new Error("[Voyzu] Watched package development requires a development runtime.");
      }
      return {
        instanceRoot: current,
        platformRoot: join(workspaceRoot, "voyzu"),
        sourceRoot: join(current, "packages"),
        runtimeRoot: join(workspaceRoot, "packages"),
        workspaceRoot,
      };
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error("[Voyzu] Could not find a Voyzu development runtime.");
}

function normalized(candidate) {
  const absolute = resolve(candidate);
  return process.platform === "win32" ? absolute.toLowerCase() : absolute;
}

function isWithin(parent, candidate) {
  const child = relative(parent, candidate);
  return child !== "" && !child.startsWith("..") && !isAbsolute(child);
}

function packagePathParts(packageName) {
  const match = /^(@[^/]+)\/([^/]+)$/.exec(packageName);
  if (!match || match[2] === "." || match[2] === "..") {
    throw new Error(`[Voyzu] Invalid scoped package name: ${packageName}`);
  }
  return [match[1], match[2]];
}

function ignored(sourceDirectory, candidate) {
  const child = relative(sourceDirectory, candidate);
  if (!child) return false;
  return child.split(sep).some((segment) => ignoredDirectoryNames.has(segment));
}

async function readPackageManifest(directory) {
  const manifestPath = join(directory, "package.json");
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`[Voyzu] Cannot read package manifest ${manifestPath}: ${error.message}`, {
      cause: error,
    });
  }
  if (typeof manifest.name !== "string") {
    throw new Error(`[Voyzu] Package manifest ${manifestPath} does not declare a name.`);
  }
  const [scope, packageDirectory] = packagePathParts(manifest.name);
  const expectedDirectory = join(dirname(dirname(directory)), scope, packageDirectory);
  if (normalized(expectedDirectory) !== normalized(directory)) {
    throw new Error(`[Voyzu] Package ${manifest.name} is not stored beneath its matching scope and name.`);
  }
  return manifest;
}

async function packageDirectories(root) {
  if (!(await pathExists(root))) return [];
  const directories = [];
  const scopes = await readdir(root, { withFileTypes: true });
  for (const scope of scopes) {
    if (!scope.isDirectory() || !scope.name.startsWith("@")) continue;
    const scopeDirectory = join(root, scope.name);
    for (const entry of await readdir(scopeDirectory, { withFileTypes: true })) {
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        directories.push(join(scopeDirectory, entry.name));
      }
    }
  }
  return directories;
}

async function packagesByName(root, label) {
  const packages = new Map();
  for (const directory of await packageDirectories(root)) {
    const manifest = await readPackageManifest(directory);
    if (packages.has(manifest.name)) {
      throw new Error(`[Voyzu] More than one ${label} package claims ${manifest.name}.`);
    }
    packages.set(manifest.name, { directory, manifest });
  }
  return packages;
}

async function discoverDevelopmentMirrors(context) {
  const installed = await packagesByName(context.runtimeRoot, "installed");
  const sources = await packagesByName(context.sourceRoot, "source");
  const mirrors = [];

  for (const [packageName, runtimePackage] of installed) {
    const sourcePackage = sources.get(packageName);
    if (!sourcePackage) continue;
    if (!isWithin(context.runtimeRoot, runtimePackage.directory)) {
      throw new Error(`[Voyzu] Runtime destination for ${packageName} is outside .run/packages.`);
    }
    if (normalized(sourcePackage.directory) === normalized(runtimePackage.directory)) {
      throw new Error(`[Voyzu] Source and runtime directories are identical for ${packageName}.`);
    }
    if (isWithin(join(context.instanceRoot, ".run"), sourcePackage.directory)) {
      throw new Error(`[Voyzu] Editable source for ${packageName} must be outside .run.`);
    }

    const runtimeStats = await lstat(runtimePackage.directory);
    const runtimeRealPath = await realpath(runtimePackage.directory);
    const sourceRealPath = await realpath(sourcePackage.directory);
    if (
      normalized(sourceRealPath) === normalized(runtimeRealPath)
      || isWithin(join(context.instanceRoot, ".run"), sourceRealPath)
    ) {
      throw new Error(`[Voyzu] Editable source for ${packageName} resolves into the runtime.`);
    }
    if (
      runtimeStats.isSymbolicLink()
      || normalized(runtimeRealPath) !== normalized(runtimePackage.directory)
    ) {
      throw new Error(
        `[Voyzu] Runtime package ${packageName} is a filesystem link. Rerun "npm run voyzu:link-package ${packageName}" to replace it with a physical copy.`,
      );
    }

    mirrors.push({
      packageName,
      runtimeDirectory: runtimePackage.directory,
      sourceDirectory: sourcePackage.directory,
    });
  }

  console.log(`[Voyzu] Installed packages: ${installed.size}`);
  console.log(`[Voyzu] Development packages: ${mirrors.length}`);
  return mirrors;
}

async function mirrorPackage(mirror) {
  const startedAt = performance.now();
  await rm(mirror.runtimeDirectory, { recursive: true, force: true });
  await mkdir(dirname(mirror.runtimeDirectory), { recursive: true });
  await cp(mirror.sourceDirectory, mirror.runtimeDirectory, {
    recursive: true,
    force: true,
    filter: (candidate) => !ignored(mirror.sourceDirectory, candidate),
  });
  console.log(
    `[Voyzu] Mirrored ${mirror.packageName} in ${Math.round(performance.now() - startedAt)}ms`,
  );
}

function dependencySnapshot(manifest) {
  return JSON.stringify(
    Object.fromEntries(
      dependencyFields.map((field) => [field, manifest[field] ?? null]),
    ),
  );
}

async function packageJsonChangesDependencies(sourceFile, runtimeFile) {
  try {
    const [sourceManifest, runtimeManifest] = await Promise.all([
      readFile(sourceFile, "utf8").then((text) => JSON.parse(text)),
      readFile(runtimeFile, "utf8").then((text) => JSON.parse(text)),
    ]);
    return dependencySnapshot(sourceManifest) !== dependencySnapshot(runtimeManifest);
  } catch {
    return false;
  }
}

async function startPackageWatcher(mirror) {
  let operation = Promise.resolve();
  const enqueue = (work) => {
    operation = operation.then(work).catch((error) => {
      console.error(`[Voyzu] Watch operation failed for ${mirror.packageName}:`, error);
    });
  };
  const destinationFor = (sourcePath) => join(
    mirror.runtimeDirectory,
    relative(mirror.sourceDirectory, sourcePath),
  );
  const displayPath = (sourcePath) => (
    `${mirror.packageName}/${relative(mirror.sourceDirectory, sourcePath).replaceAll("\\", "/")}`
  );
  const watcher = watch(mirror.sourceDirectory, {
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 20 },
    ignoreInitial: true,
    ignored: (candidate) => ignored(mirror.sourceDirectory, candidate),
  });

  watcher.on("add", (sourcePath) => enqueue(async () => {
    const destination = destinationFor(sourcePath);
    await mkdir(dirname(destination), { recursive: true });
    await cp(sourcePath, destination, { force: true });
    console.log(`[Voyzu] Added ${displayPath(sourcePath)}`);
  }));
  watcher.on("change", (sourcePath) => enqueue(async () => {
    const destination = destinationFor(sourcePath);
    const dependenciesChanged = sourcePath.endsWith(`${sep}package.json`)
      && await packageJsonChangesDependencies(sourcePath, destination);
    await mkdir(dirname(destination), { recursive: true });
    await cp(sourcePath, destination, { force: true });
    console.log(`[Voyzu] Updated ${displayPath(sourcePath)}`);
    if (dependenciesChanged) {
      console.warn(
        `[Voyzu] ${mirror.packageName} dependencies changed. Restart development or rerun package installation to reconcile dependencies.`,
      );
    }
  }));
  watcher.on("unlink", (sourcePath) => enqueue(async () => {
    await rm(destinationFor(sourcePath), { force: true });
    console.log(`[Voyzu] Removed ${displayPath(sourcePath)}`);
  }));
  watcher.on("addDir", (sourcePath) => enqueue(async () => {
    await mkdir(destinationFor(sourcePath), { recursive: true });
    console.log(`[Voyzu] Added directory ${displayPath(sourcePath)}`);
  }));
  watcher.on("unlinkDir", (sourcePath) => enqueue(async () => {
    await rm(destinationFor(sourcePath), { recursive: true, force: true });
    console.log(`[Voyzu] Removed directory ${displayPath(sourcePath)}`);
  }));
  watcher.on("error", (error) => {
    console.error(`[Voyzu] Watcher failed for ${mirror.packageName}:`, error);
  });

  await new Promise((resolvePromise, reject) => {
    watcher.once("ready", resolvePromise);
    watcher.once("error", reject);
  });
  console.log(`[Voyzu] Watching ${mirror.packageName}`);
  return watcher;
}

async function terminateChild(child) {
  if (child.exitCode !== null) return;
  if (process.platform !== "win32") {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
    return;
  }
  await new Promise((resolvePromise) => {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.once("error", resolvePromise);
    killer.once("exit", resolvePromise);
  });
}

async function main() {
  const context = await findDevelopmentInstance();
  const mirrors = await discoverDevelopmentMirrors(context);
  for (const mirror of mirrors) await mirrorPackage(mirror);
  const watchers = await Promise.all(mirrors.map(startPackageWatcher));

  console.log("[Voyzu] Starting Next.js");
  const command = process.platform === "win32"
    ? (process.env.ComSpec ?? "cmd.exe")
    : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", "npm run dev"]
    : ["run", "dev"];
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    if (name.toLowerCase() === "npm_config_global_ignore_file") delete env[name];
  }
  const nextProcess = spawn(command, args, {
    cwd: context.platformRoot,
    detached: process.platform !== "win32",
    env,
    stdio: "inherit",
  });

  let shuttingDown = false;
  const shutdown = async (exitCode, terminate = true) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\n[Voyzu] Stopping package watchers");
    await Promise.all(watchers.map((watcher) => watcher.close()));
    if (terminate) await terminateChild(nextProcess);
    process.exitCode = exitCode;
  };

  process.once("SIGINT", () => void shutdown(130));
  process.once("SIGTERM", () => void shutdown(143));
  nextProcess.once("error", async (error) => {
    console.error("[Voyzu] Could not start Next.js:", error);
    await shutdown(1);
  });
  nextProcess.once("exit", async (code, signal) => {
    await shutdown(code ?? (signal ? 1 : 0), false);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
