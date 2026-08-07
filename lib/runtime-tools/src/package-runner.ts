import { readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { config } from "dotenv";
import { Pool } from "pg";

type PackageModule = {
  pageRoutes: Record<string, unknown>;
  apiDefinitions: Record<string, unknown>;
};

type PackageDefinition = {
  modules: readonly PackageModule[];
  install?: {
    sql?: readonly string[];
    seedSql?: readonly string[];
  };
  uninstall?: {
    sql?: readonly string[];
  };
  scripts?: Record<string, () => void | Promise<void>>;
};

function usage(): never {
  throw new Error(
    "Internal usage: package-runner <install|uninstall|run> <instance-root> <package-directory> [script] [parameters...]",
  );
}

function validateDefinition(value: unknown): PackageDefinition {
  if (!value || typeof value !== "object") {
    throw new Error("voyzu.package.ts must export a package definition.");
  }
  const definition = value as Partial<PackageDefinition>;
  if (!Array.isArray(definition.modules)) {
    throw new Error("voyzu.package.ts modules must be an array.");
  }
  for (const [index, moduleDefinition] of definition.modules.entries()) {
    if (!moduleDefinition || typeof moduleDefinition !== "object") {
      throw new Error(`Module at index ${index} must be an object.`);
    }
    if (!moduleDefinition.pageRoutes || typeof moduleDefinition.pageRoutes !== "object") {
      throw new Error(`Module at index ${index} must define pageRoutes.`);
    }
    if (!moduleDefinition.apiDefinitions || typeof moduleDefinition.apiDefinitions !== "object") {
      throw new Error(`Module at index ${index} must define apiDefinitions.`);
    }
  }
  for (const [key, paths] of Object.entries(definition.install ?? {})) {
    if (!["sql", "seedSql"].includes(key) || !Array.isArray(paths)) {
      throw new Error(`voyzu.package.ts install.${key} must be an array.`);
    }
    if (paths.some((path) => typeof path !== "string" || path.length === 0)) {
      throw new Error(`voyzu.package.ts install.${key} contains an invalid path.`);
    }
  }
  for (const [key, paths] of Object.entries(definition.uninstall ?? {})) {
    if (key !== "sql" || !Array.isArray(paths)) {
      throw new Error(`voyzu.package.ts uninstall.${key} must be an array.`);
    }
    if (paths.some((path) => typeof path !== "string" || path.length === 0)) {
      throw new Error(`voyzu.package.ts uninstall.${key} contains an invalid path.`);
    }
  }
  if (
    definition.modules.length === 0
    && !(definition.install?.sql?.length || definition.install?.seedSql?.length)
  ) {
    throw new Error(
      "voyzu.package.ts must define at least one module or database installation file.",
    );
  }
  return definition as PackageDefinition;
}

async function loadDefinition(packageDirectory: string): Promise<PackageDefinition> {
  const manifestUrl = pathToFileURL(resolve(packageDirectory, "voyzu.package.ts"));
  manifestUrl.searchParams.set("voyzu", `${Date.now()}`);
  const module = await import(manifestUrl.href);
  return validateDefinition(module.default);
}

async function loadPackageName(packageDirectory: string): Promise<string> {
  const manifestPath = resolve(packageDirectory, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    name?: unknown;
  };
  if (typeof manifest.name !== "string" || manifest.name.length === 0) {
    throw new Error("package.json name must be a non-empty string.");
  }
  return manifest.name;
}

function resolvePackageFile(packageDirectory: string, declaredPath: string): string {
  const path = resolve(packageDirectory, declaredPath);
  const relativePath = relative(packageDirectory, path);
  if (
    relativePath === ".."
    || relativePath.startsWith(`..${sep}`)
    || resolve(path) === resolve(packageDirectory)
  ) {
    throw new Error(`Package file escapes its package directory: ${declaredPath}`);
  }
  return path;
}

function loadInstanceEnvironment(instanceRoot: string): void {
  config({
    path: resolve(instanceRoot, ".env.local"),
    quiet: true,
  });
}

async function install(
  instanceRoot: string,
  packageDirectory: string,
  packageName: string,
  definition: PackageDefinition,
): Promise<void> {
  const sqlFiles = [
    ...(definition.install?.sql ?? []),
    ...(definition.install?.seedSql ?? []),
  ];
  if (sqlFiles.length === 0) {
    console.log(`${packageName}: no database installation files.`);
    return;
  }

  loadInstanceEnvironment(instanceRoot);
  const databaseUrl = process.env.VOYZU_DATABASE_URL;
  if (
    !databaseUrl
    || databaseUrl.includes("<")
    || databaseUrl.includes(">")
    || databaseUrl.includes("CHANGE_ME")
  ) {
    throw new Error(
      "Set VOYZU_DATABASE_URL in .env.local before installing packages with database scripts.",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    for (const declaredPath of sqlFiles) {
      const path = resolvePackageFile(packageDirectory, declaredPath);
      const sql = await readFile(path, "utf8");
      await pool.query(sql);
      console.log(`  executed ${declaredPath}`);
    }
  } finally {
    await pool.end();
  }
}

async function uninstall(
  instanceRoot: string,
  packageDirectory: string,
  packageName: string,
  definition: PackageDefinition,
): Promise<void> {
  const sqlFiles = definition.uninstall?.sql ?? [];
  if (sqlFiles.length === 0) {
    console.log(`${packageName}: no database uninstall files.`);
    return;
  }

  loadInstanceEnvironment(instanceRoot);
  const databaseUrl = process.env.VOYZU_DATABASE_URL;
  if (
    !databaseUrl
    || databaseUrl.includes("<")
    || databaseUrl.includes(">")
    || databaseUrl.includes("CHANGE_ME")
  ) {
    throw new Error(
      "Set VOYZU_DATABASE_URL in .env.local before uninstalling packages with database scripts.",
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    for (const declaredPath of sqlFiles) {
      const path = resolvePackageFile(packageDirectory, declaredPath);
      const sql = await readFile(path, "utf8");
      await db.query(sql);
      console.log(`  executed ${declaredPath}`);
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
    await pool.end();
  }
}

async function runScript(
  packageName: string,
  definition: PackageDefinition,
  scriptName: string,
  parameters: string[],
): Promise<void> {
  const script = definition.scripts?.[scriptName];
  if (typeof script !== "function") {
    const available = Object.keys(definition.scripts ?? {});
    throw new Error(
      `${packageName} does not define script "${scriptName}". Available scripts: ${available.join(", ") || "none"}.`,
    );
  }

  process.argv = [process.argv[0], `${packageName}:${scriptName}`, ...parameters];
  await script();
  console.log(`Completed ${packageName}:${scriptName}.`);
}

const [action, instanceRoot, packageDirectory, scriptName, ...parameters] =
  process.argv.slice(2);
if (!action || !instanceRoot || !packageDirectory) usage();

loadInstanceEnvironment(instanceRoot);
const packageName = await loadPackageName(packageDirectory);
const definition = await loadDefinition(packageDirectory);

if (action === "install") {
  await install(instanceRoot, packageDirectory, packageName, definition);
} else if (action === "uninstall") {
  await uninstall(instanceRoot, packageDirectory, packageName, definition);
} else if (action === "run" && scriptName) {
  await runScript(packageName, definition, scriptName, parameters);
} else {
  usage();
}
