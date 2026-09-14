import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  generateOperationDocs,
  generateOpenApi,
  type HttpApiDocumentationRegistration,
} from "../src/lib/index";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));

function findPlatformRoot(startDirectory: string): string {
  let currentDirectory = startDirectory;
  while (true) {
    if (
      fs.existsSync(path.join(currentDirectory, "apps", "web"))
      && fs.existsSync(path.join(currentDirectory, "packages", "@voyzu", "http-api-reference"))
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

export async function buildHttpApiReference(): Promise<void> {
  const platformRoot = findPlatformRoot(SCRIPT_DIRECTORY);
  const generatedFilesDirectory = "apps/web/.generated/http-api-reference";
  const httpApiRoutesDirectory = path.join(
    platformRoot,
    "apps",
    "web",
    ".generated",
    "http-api-routes",
  );
  const preInstalledIndex = await import(pathToFileURL(
    path.join(httpApiRoutesDirectory, "pre-installed.ts"),
  ).href) as {
    preInstalledHttpApiRegistrations: HttpApiDocumentationRegistration[];
  };
  const installedIndex = await import(pathToFileURL(
    path.join(httpApiRoutesDirectory, "installed.ts"),
  ).href) as {
    installedHttpApiRegistrations: HttpApiDocumentationRegistration[];
  };
  const registrations: HttpApiDocumentationRegistration[] = [
    ...preInstalledIndex.preInstalledHttpApiRegistrations,
    ...installedIndex.installedHttpApiRegistrations,
  ];
  const writtenFiles = generateOperationDocs({
    workspaceRoot: platformRoot,
    outputDir: generatedFilesDirectory,
    registrations,
  });
  const openApiFile = generateOpenApi({
    workspaceRoot: platformRoot,
    operationDocsDir: generatedFilesDirectory,
    outputFile: "apps/web/.generated/http-api-reference/openapi.json",
  });

  console.log(`Wrote ${writtenFiles.length} generated HTTP API reference files.`);
  console.log(`Wrote ${path.relative(platformRoot, openApiFile)}.`);
}
