import * as fs from "node:fs";
import * as path from "node:path";

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

export function generatedFilesRoot(): string {
  return path.join(findPlatformRoot(process.cwd()), "apps", "web", ".generated", "api-reference");
}
