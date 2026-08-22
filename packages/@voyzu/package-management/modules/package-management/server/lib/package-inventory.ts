import { access, readFile, readdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

interface PackageManifest {
  name?: string;
  description?: string;
  repository?: string;
  exports?: Record<string, unknown>;
  voyzu?: {
    "voyzu-package"?: boolean;
    allowInstall?: boolean;
    dependencies?: string[];
    pageRootPaths?: string[];
    apiRootPaths?: string[];
    preinstalled?: boolean;
  };
}

export interface DiscoveredPackage {
  code: string;
  description: string;
  repository: string;
  preinstalled: boolean;
  hasTopNavigation: boolean;
  pageRootPaths: string[];
  apiRootPaths: string[];
}

export interface InstalledPackageFiles {
  packageJson: string;
  packageDefinition: string;
}

const PLATFORM_PACKAGE_ORDER = [
  "@voyzu/foundation",
  "@voyzu/auth",
  "@voyzu/package-management",
  "@voyzu/system-info",
  "@voyzu/audit",
  "@voyzu/localization",
  "@voyzu/welcome",
  "@voyzu/ui-reference",
  "@voyzu/api-reference",
] as const;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(directory: string): Promise<PackageManifest | null> {
  const path = join(directory, "package.json");
  if (!(await exists(path))) return null;
  return JSON.parse(await readFile(path, "utf8")) as PackageManifest;
}

async function findPlatformRoot(start = process.cwd()): Promise<string> {
  const configured = process.env.VOYZU_PLATFORM_ROOT;
  if (configured) return resolve(configured);

  let current = resolve(start);
  while (true) {
    const manifest = await readManifest(current);
    if (manifest && (manifest as { name?: string }).name === "voyzu") return current;
    const parent = dirname(current);
    if (parent === current) throw new Error("Could not locate the Voyzu platform root.");
    current = parent;
  }
}

function workspaceRoot(platformRoot: string): string {
  if (process.env.VOYZU_WORKSPACE_ROOT) return resolve(process.env.VOYZU_WORKSPACE_ROOT);
  const parent = dirname(platformRoot);
  return basename(parent) === ".run" ? parent : platformRoot;
}

async function packageDirectories(root: string): Promise<string[]> {
  if (!(await exists(root))) return [];
  const directories: string[] = [];
  const scopes = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("@"))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const scope of scopes) {
    const scopeRoot = join(root, scope.name);
    const entries = (await readdir(scopeRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
      .sort((left, right) => left.name.localeCompare(right.name));
    directories.push(...entries.map((entry) => join(scopeRoot, entry.name)));
  }
  return directories;
}

function hasExport(manifest: PackageManifest, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(manifest.exports ?? {}, name);
}

export async function discoverInstalledPackages(): Promise<DiscoveredPackage[]> {
  const platformRoot = await findPlatformRoot();
  const runtimeWorkspaceRoot = workspaceRoot(platformRoot);
  const roots = [
    join(platformRoot, "packages"),
    ...(runtimeWorkspaceRoot === platformRoot ? [] : [join(runtimeWorkspaceRoot, "packages")]),
  ];
  const discovered = new Map<string, DiscoveredPackage>();

  for (const root of roots) {
    for (const directory of await packageDirectories(root)) {
      const manifest = await readManifest(directory);
      if (!manifest?.name || manifest.voyzu?.["voyzu-package"] !== true) continue;
      discovered.set(manifest.name, {
        code: manifest.name,
        description: manifest.description?.trim() ?? "",
        repository: manifest.repository?.trim() ?? "",
        preinstalled: manifest.voyzu.preinstalled === true,
        hasTopNavigation:
          hasExport(manifest, "./navigation/top-nav")
          || hasExport(manifest, "./navigation/domains"),
        pageRootPaths: manifest.voyzu.pageRootPaths ?? [],
        apiRootPaths: manifest.voyzu.apiRootPaths ?? [],
      });
    }
  }

  const platformOrder = new Map<string, number>(
    PLATFORM_PACKAGE_ORDER.map((name, index) => [name, index]),
  );
  return [...discovered.values()].sort((left, right) => {
    const leftOrder = platformOrder.get(left.code) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = platformOrder.get(right.code) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || left.code.localeCompare(right.code);
  });
}

export async function readInstalledPackageFiles(
  packageName: string,
): Promise<InstalledPackageFiles | null> {
  const parts = packageName.split("/");
  if (
    parts.length !== 2
    || !parts[0]?.startsWith("@")
    || parts.some((part) => !part || part === "." || part === "..")
  ) {
    return null;
  }

  const platformRoot = await findPlatformRoot();
  const runtimeWorkspaceRoot = workspaceRoot(platformRoot);
  const roots = [
    join(platformRoot, "packages"),
    ...(runtimeWorkspaceRoot === platformRoot ? [] : [join(runtimeWorkspaceRoot, "packages")]),
  ];

  for (const root of roots) {
    const directory = join(root, ...parts);
    const manifest = await readManifest(directory);
    if (
      manifest?.name !== packageName
      || manifest.voyzu?.["voyzu-package"] !== true
      || !(await exists(join(directory, "voyzu.package.ts")))
    ) {
      continue;
    }
    const [packageJson, packageDefinition] = await Promise.all([
      readFile(join(directory, "package.json"), "utf8"),
      readFile(join(directory, "voyzu.package.ts"), "utf8"),
    ]);
    return { packageJson, packageDefinition };
  }

  return null;
}
