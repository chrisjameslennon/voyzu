import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { generateOperationDocs, generateOpenApi } from "../src/lib/index";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

function findPlatformRoot(startDirectory: string): string {
  let currentDirectory = startDirectory;
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

export async function buildApiReference(): Promise<void> {
  const platformRoot = findPlatformRoot(SCRIPT_DIRECTORY);
  const generatedFilesDirectory = "apps/web/app/generated-files";
  const writtenFiles = generateOperationDocs({
    workspaceRoot: platformRoot,
    outputDir: generatedFilesDirectory,
  });
  const openApiFile = generateOpenApi({
    workspaceRoot: platformRoot,
    operationDocsDir: generatedFilesDirectory,
    outputFile: "apps/web/public/voyzu/openapi.json",
  });

  console.log(`Wrote ${writtenFiles.length} generated API reference files.`);
  console.log(`Wrote ${path.relative(platformRoot, openApiFile)}.`);
}
