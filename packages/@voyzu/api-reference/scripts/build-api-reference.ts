import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { capabilityModule } from "@voyzu/api/capability-module";
import {
  generateOperationDocs,
  generateOpenApi,
  type ApiDocumentationRegistration,
} from "../src/lib/index";

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
  const generatedFilesDirectory = "apps/web/.generated/api-reference";
  const apiRouteIndexPath = path.join(
    platformRoot,
    "apps",
    "web",
    ".generated",
    "api-routes",
    "index.ts",
  );
  const generatedIndex = await import(pathToFileURL(apiRouteIndexPath).href) as {
    preinstalledApiRouteModules: ApiDocumentationRegistration[];
  };
  const installedIndex = await import(pathToFileURL(
    path.join(path.dirname(apiRouteIndexPath), "installed.ts"),
  ).href) as {
    installedApiRouteModules: ApiDocumentationRegistration[];
  };
  const registrations: ApiDocumentationRegistration[] = [
    ...generatedIndex.preinstalledApiRouteModules,
    ...installedIndex.installedApiRouteModules,
    {
      packageName: "@voyzu/api",
      moduleName: "capability",
      routes: Object.values(capabilityModule.apiDefinitions),
    },
  ];
  const writtenFiles = generateOperationDocs({
    workspaceRoot: platformRoot,
    outputDir: generatedFilesDirectory,
    registrations,
  });
  const openApiFile = generateOpenApi({
    workspaceRoot: platformRoot,
    operationDocsDir: generatedFilesDirectory,
    outputFile: "apps/web/.generated/api-reference/openapi.json",
  });

  console.log(`Wrote ${writtenFiles.length} generated API reference files.`);
  console.log(`Wrote ${path.relative(platformRoot, openApiFile)}.`);
}
