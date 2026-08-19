import * as fs from "node:fs";
import * as path from "node:path";

interface GeneratedOperationNav {
  method: string;
  path: string;
  summary: string;
  tags?: string[];
}

export interface GeneratedApiModule {
  folderName: string;
  label: string;
  path: string;
  operations: GeneratedOperationNav[];
}

export interface GeneratedApiPackage {
  folderName: string;
  packageName: string;
  modules: GeneratedApiModule[];
}

function findPlatformRoot(startDirectory: string): string {
  let currentDirectory = path.resolve(startDirectory);
  while (true) {
    if (
      fs.existsSync(path.join(currentDirectory, "apps", "web"))
      && fs.existsSync(path.join(currentDirectory, "packages", "@voyzu", "api-reference"))
    ) {
      return currentDirectory;
    }
    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      throw new Error(`Could not find the Voyzu platform root from ${startDirectory}`);
    }
    currentDirectory = parentDirectory;
  }
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readOperations(moduleDirectory: string): GeneratedOperationNav[] {
  return fs.readdirSync(moduleDirectory)
    .filter((fileName) => fileName.endsWith(".operation-doc.json"))
    .map((fileName) => JSON.parse(
      fs.readFileSync(path.join(moduleDirectory, fileName), "utf-8"),
    ) as GeneratedOperationNav)
    .sort(
      (left, right) =>
        left.summary.localeCompare(right.summary)
        || left.path.localeCompare(right.path)
        || left.method.localeCompare(right.method),
    );
}

export function generatedFilesRoot(): string {
  return path.join(findPlatformRoot(process.cwd()), "apps", "web", ".generated", "api-reference");
}

export function readGeneratedApiPackages(): GeneratedApiPackage[] {
  const generatedRoot = generatedFilesRoot();
  if (!fs.existsSync(generatedRoot)) return [];

  return fs.readdirSync(generatedRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const packageDirectory = path.join(generatedRoot, entry.name);
      const packageDocPath = path.join(packageDirectory, "package-doc.json");
      if (!fs.existsSync(packageDocPath)) return [];
      const packageDoc = JSON.parse(fs.readFileSync(packageDocPath, "utf-8")) as {
        packageName: string;
      };
      const modules = fs.readdirSync(packageDirectory, { withFileTypes: true })
        .filter((moduleEntry) => moduleEntry.isDirectory() && moduleEntry.name !== "types")
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((moduleEntry) => {
          const operations = readOperations(path.join(packageDirectory, moduleEntry.name));
          if (operations.length === 0) return [];
          return [{
            folderName: moduleEntry.name,
            label: packageDoc.packageName === "@voyzu/audit"
              ? "Audit"
              : operations[0].tags?.[0] ?? titleCase(moduleEntry.name),
            path: `/api-reference/${entry.name}/${moduleEntry.name}`,
            operations,
          }];
        });
      return modules.length
        ? [{ folderName: entry.name, packageName: packageDoc.packageName, modules }]
        : [];
    });
}

export function operationAnchor(summary: string): string {
  return summary
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
