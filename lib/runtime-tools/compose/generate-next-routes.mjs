#!/usr/bin/env node

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { Node, Project, SyntaxKind } from "ts-morph";

function parseArgs(args) {
  const options = { runtime: process.cwd(), packagesRoot: undefined, packages: [], validateOnly: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--runtime") options.runtime = args[++index];
    else if (argument === "--packages-root") options.packagesRoot = args[++index];
    else if (argument === "--package") options.packages.push(args[++index]);
    else if (argument === "--validate-only") options.validateOnly = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
const runtimeRoot = resolve(options.runtime);
const webRoot = join(runtimeRoot, "apps", "web");
const outputRoot = join(webRoot, "app", "(generated)");
const project = new Project({
  tsConfigFilePath: join(runtimeRoot, "tsconfig.json"),
  skipAddingFilesFromTsConfig: true,
});

function property(object, name) {
  const node = object.getProperty(name);
  if (Node.isPropertyAssignment(node)) return node.getInitializer();
  if (Node.isShorthandPropertyAssignment(node)) return node.getNameNode();
  return undefined;
}

function objectExpression(expression, sourceFile) {
  if (!expression) return undefined;
  if (Node.isObjectLiteralExpression(expression)) return expression;
  if (Node.isAsExpression(expression) || Node.isSatisfiesExpression(expression) || Node.isParenthesizedExpression(expression)) {
    return objectExpression(expression.getExpression(), sourceFile);
  }
  if (Node.isIdentifier(expression)) {
    return objectExpression(sourceFile.getVariableDeclaration(expression.getText())?.getInitializer(), sourceFile);
  }
  return undefined;
}

function stringValue(expression) {
  if (Node.isStringLiteral(expression) || Node.isNoSubstitutionTemplateLiteral(expression)) return expression.getLiteralValue();
  return undefined;
}

function resolveModule(packageDirectory, specifier) {
  const unresolved = resolve(packageDirectory, specifier);
  for (const candidate of [unresolved, `${unresolved}.ts`, `${unresolved}.tsx`, join(unresolved, "index.ts")]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Could not resolve ${specifier} from ${packageDirectory}.`);
}

function registeredModules(packageDirectory, manifest) {
  const definitionPath = join(packageDirectory, "voyzu.package.ts");
  const sourceFile = project.addSourceFileAtPath(definitionPath);
  const packageObject = sourceFile.getVariableDeclarations()
    .map((declaration) => objectExpression(declaration.getInitializer(), sourceFile))
    .find((candidate) => candidate && property(candidate, "modules"));
  const modules = packageObject && property(packageObject, "modules");
  if (!modules || !Node.isArrayLiteralExpression(modules)) {
    throw new Error(`${definitionPath} modules must be an array literal.`);
  }
  return modules.getElements().map((element, index) => {
    if (!Node.isIdentifier(element)) throw new Error(`${definitionPath} modules must contain imported identifiers.`);
    const localName = element.getText();
    for (const declaration of sourceFile.getImportDeclarations()) {
      const imported = declaration.getNamedImports().find(
        (item) => (item.getAliasNode()?.getText() ?? item.getName()) === localName,
      );
      if (!imported) continue;
      const filePath = resolveModule(packageDirectory, declaration.getModuleSpecifierValue());
      return {
        name: imported.getName(),
        filePath,
        specifier: `${manifest.name}/voyzu-package`,
        importName: "packageDefinition",
        expression: `packageDefinition.modules[${index}]`,
      };
    }
    throw new Error(`Could not resolve registered module ${localName} from ${definitionPath}.`);
  });
}

async function packageDirectories(root) {
  if (!root || !existsSync(root)) return [];
  const result = [];
  for (const scope of await readdir(root, { withFileTypes: true })) {
    if (!scope.isDirectory() || !scope.name.startsWith("@")) continue;
    const scopeRoot = join(root, scope.name);
    for (const entry of await readdir(scopeRoot, { withFileTypes: true })) {
      if (entry.isDirectory() || entry.isSymbolicLink()) result.push(join(scopeRoot, entry.name));
    }
  }
  return result;
}

function routeEntries(module, packageInfo) {
  const sourceFile = project.addSourceFileAtPath(module.filePath);
  const declaration = sourceFile.getVariableDeclaration(module.name);
  const moduleObject = objectExpression(declaration?.getInitializer(), sourceFile);
  if (!moduleObject) throw new Error(`Could not read module ${module.name} from ${module.filePath}.`);

  function entries(propertyName) {
    const routes = objectExpression(property(moduleObject, propertyName), sourceFile);
    if (!routes) return [];
    return routes.getProperties().flatMap((routeProperty) => {
      if (!Node.isPropertyAssignment(routeProperty)) return [];
      const route = objectExpression(routeProperty.getInitializer(), sourceFile);
      if (!route) return [];
      const path = stringValue(property(route, "path"));
      if (!path) throw new Error(`${module.filePath} ${propertyName}.${routeProperty.getName()} must have a literal path.`);
      return [{
        key: routeProperty.getName(),
        path,
        route,
        sourceFile,
        module,
        package: packageInfo,
      }];
    });
  }

  return { pages: entries("pageRoutes"), apis: entries("apiDefinitions") };
}

function placeholders(path) {
  return [...path.matchAll(/\/\[([^/\]]+)\](?=\/|$)/g)].map((match) => match[1]);
}

function normalizedPath(path) {
  return path.replace(/\/\[[^/\]]+\](?=\/|$)/g, "/[]");
}

function requestPathNames(api) {
  const request = objectExpression(property(api.route, "request"), api.sourceFile);
  if (!request) return [];
  const path = objectExpression(property(request, "path"), api.sourceFile);
  return path ? path.getProperties().map((item) => item.getName()) : [];
}

function assertUnique(items, key, description) {
  const seen = new Map();
  for (const item of items) {
    const value = key(item);
    const existing = seen.get(value);
    if (existing) {
      throw new Error(`${description} ${value} is declared by ${existing.package.name} and ${item.package.name}.`);
    }
    seen.set(value, item);
  }
}

function validateRoutes(pages, apis) {
  for (const page of pages) {
    if (!stringValue(property(page.route, "id"))) {
      throw new Error(`${page.package.name} page ${page.path} must have a literal id.`);
    }
  }
  for (const api of apis) {
    if (!stringValue(property(api.route, "method"))) {
      throw new Error(`${api.package.name} API route ${api.path} must have a literal method.`);
    }
  }

  assertUnique(pages, (page) => stringValue(property(page.route, "id")), "Duplicate page id");
  assertUnique(pages, (page) => normalizedPath(page.path), "Duplicate page path");
  assertUnique(apis, (api) => `${stringValue(property(api.route, "method"))} ${normalizedPath(api.path)}`, "Duplicate API route");

  const apiPathShapes = new Map();
  for (const api of apis) {
    const shape = normalizedPath(api.path);
    const existingPath = apiPathShapes.get(shape);
    if (existingPath && existingPath !== api.path) {
      throw new Error(`Conflicting API dynamic parameter names: ${existingPath} and ${api.path}.`);
    }
    apiPathShapes.set(shape, api.path);
  }

  const packages = [...new Map(
    [...pages, ...apis].map((route) => [route.package.name, route.package]),
  ).values()];
  for (const propertyName of ["pageRootPaths", "apiRootPaths"]) {
    for (let leftIndex = 0; leftIndex < packages.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < packages.length; rightIndex += 1) {
        const left = packages[leftIndex];
        const right = packages[rightIndex];
        for (const leftRoot of left.manifest.voyzu?.[propertyName] ?? []) {
          const rightRoot = (right.manifest.voyzu?.[propertyName] ?? []).find(
            (candidate) => leftRoot === candidate
              || leftRoot.startsWith(`${candidate}/`)
              || candidate.startsWith(`${leftRoot}/`),
          );
          if (rightRoot) {
            throw new Error(
              `${left.name} and ${right.name} have colliding ${propertyName}: ${leftRoot} and ${rightRoot}.`,
            );
          }
        }
      }
    }
  }

  for (const page of pages) {
    const roots = page.package.manifest.voyzu?.pageRootPaths ?? [];
    if (!roots.some((root) => page.path === root || page.path.startsWith(`${root}/`))) {
      throw new Error(`${page.package.name} page route ${page.path} is outside its declared page root paths.`);
    }
  }

  for (const api of apis) {
    const roots = api.package.manifest.voyzu?.apiRootPaths ?? [];
    if (!roots.some((root) => api.path === root || api.path.startsWith(`${root}/`))) {
      throw new Error(`${api.package.name} API route ${api.path} is outside its declared API root paths.`);
    }
    const expected = placeholders(api.path).sort();
    const declared = requestPathNames(api).sort();
    if (expected.join("\0") !== declared.join("\0")) {
      throw new Error(
        `${api.package.name} ${stringValue(property(api.route, "method"))} ${api.path} path placeholders (${expected.join(", ") || "none"}) do not match request.path (${declared.join(", ") || "none"}).`,
      );
    }
  }
}

function relativeImport(fromFile, target) {
  let value = relative(dirname(fromFile), target).split(sep).join("/");
  if (!value.startsWith(".")) value = `./${value}`;
  return value.replace(/\.(?:ts|tsx|mjs)$/, "");
}

function routeDirectory(root, path) {
  return join(root, ...path.split("/").filter(Boolean));
}

function pageSource(page, filePath) {
  const routeId = stringValue(property(page.route, "id"));
  if (!routeId) throw new Error(`${page.package.name} page ${page.path} must have a literal id.`);
  const helpBaseUrl = page.package.manifest.voyzu?.settings?.helpBaseUrl;
  const moduleId = routeId.match(/^voyzu\.(.+)\.page\./)?.[1];
  const hasApis = page.package.moduleApis.get(page.module.name) === true;
  const apiDocsUrl = hasApis && moduleId
    ? `/api-reference/${page.package.name.replace("/", "-")}/${moduleId}`
    : undefined;
  const renderer = relativeImport(filePath, join(webRoot, "src", "surface", "render-page.tsx"));
  const importLine = page.module.importName === "packageDefinition"
    ? `import packageDefinition from ${JSON.stringify(page.module.specifier)};`
    : `import { ${page.module.importName} } from ${JSON.stringify(page.module.specifier)};`;
  return `// Generated by voyzu compose. Do not edit.\n${importLine}\nimport { createPageRoute, generatePageMetadata, renderPage } from ${JSON.stringify(renderer)};\n\nconst route = createPageRoute(${page.module.expression}.pageRoutes.${page.key}, {\n  packageName: ${JSON.stringify(page.package.name)},\n  helpBaseUrl: ${helpBaseUrl === undefined ? "undefined" : JSON.stringify(helpBaseUrl)},\n  apiDocsUrl: ${apiDocsUrl === undefined ? "undefined" : JSON.stringify(apiDocsUrl)},\n});\n\nexport const generateMetadata = () => generatePageMetadata(route);\nexport default (context: Parameters<typeof renderPage>[1]) => renderPage(route, context);\n`;
}

function apiSource(group, filePath) {
  const helper = relativeImport(filePath, join(webRoot, "src", "api", "create-route-handler.ts"));
  const imports = new Map();
  for (const api of group) imports.set(api.module.specifier, api.module.importName);
  const lines = [
    "// Generated by voyzu compose. Do not edit.",
    `import { createApiRouteHandler } from ${JSON.stringify(helper)};`,
    ...[...imports].map(([specifier, name]) => name === "packageDefinition"
      ? `import packageDefinition from ${JSON.stringify(specifier)};`
      : `import { ${name} } from ${JSON.stringify(specifier)};`),
    "",
  ];
  for (const api of group) {
    const method = stringValue(property(api.route, "method"));
    lines.push(`export const ${method} = createApiRouteHandler(${api.module.expression}.apiDefinitions.${api.key});`);
  }
  return `${lines.join("\n")}\n`;
}

async function writeSource(filePath, source) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, source, "utf8");
}

async function discover() {
  const platformPackagesRoot = join(runtimeRoot, "packages");
  const roots = [platformPackagesRoot, options.packagesRoot && resolve(options.packagesRoot)]
    .filter(Boolean)
    .filter((root, index, values) => values.indexOf(root) === index);
  const selectedPackages = new Set(options.packages);
  const packagesByName = new Map();
  for (const root of roots) {
    for (const directory of await packageDirectories(root)) {
      const manifestPath = join(directory, "package.json");
      const definitionPath = join(directory, "voyzu.package.ts");
      if (!existsSync(manifestPath) || !existsSync(definitionPath)) continue;
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      if (manifest.voyzu?.["voyzu-package"] !== true) continue;
      if (root !== platformPackagesRoot && !selectedPackages.has(manifest.name)) continue;
      packagesByName.set(manifest.name, { name: manifest.name, directory, manifest });
    }
  }

  const packages = [...packagesByName.values()];
  for (const packageInfo of packages) {
    packageInfo.modules = registeredModules(packageInfo.directory, packageInfo.manifest);
    packageInfo.moduleApis = new Map();
  }

  const capabilityManifest = JSON.parse(await readFile(join(runtimeRoot, "lib", "api", "package.json"), "utf8"));
  const capabilityPath = join(runtimeRoot, "lib", "api", "src", "capability.module.ts");
  const capabilityPackage = {
    name: capabilityManifest.name,
    directory: join(runtimeRoot, "lib", "api"),
    manifest: {
      ...capabilityManifest,
      voyzu: { pageRootPaths: [], apiRootPaths: ["/capability"] },
    },
    modules: [{
      name: "capabilityModule",
      filePath: capabilityPath,
      specifier: "@voyzu/api/capability-module",
      importName: "capabilityModule",
      expression: "capabilityModule",
    }],
    moduleApis: new Map(),
  };
  packages.push(capabilityPackage);

  const pages = [];
  const apis = [];
  for (const packageInfo of packages) {
    for (const module of packageInfo.modules) {
      const entries = routeEntries(module, packageInfo);
      packageInfo.moduleApis.set(module.name, entries.apis.length > 0);
      pages.push(...entries.pages);
      apis.push(...entries.apis);
    }
  }
  validateRoutes(pages, apis);
  return { pages, apis };
}

async function main() {
  const { pages, apis } = await discover();
  if (options.validateOnly) return;

  await rm(outputRoot, { recursive: true, force: true });

  const layoutPath = join(outputRoot, "(web)", "layout.tsx");
  const layoutImport = relativeImport(layoutPath, join(webRoot, "src", "surface", "VoyzuWebLayout.tsx"));
  await writeSource(layoutPath, `// Generated by voyzu compose. Do not edit.\nexport { default, viewport } from ${JSON.stringify(layoutImport)};\n`);

  const homePath = join(outputRoot, "(web)", "page.tsx");
  await writeSource(homePath, `// Generated by voyzu compose. Do not edit.\nimport { redirect } from "next/navigation";\nimport { getHomePageRoute } from "@voyzu/package-management/server";\n\nexport default async function HomePage() {\n  redirect(await getHomePageRoute());\n}\n`);

  for (const page of pages) {
    const filePath = join(routeDirectory(join(outputRoot, "(web)"), page.path), "page.tsx");
    await writeSource(filePath, pageSource(page, filePath));
  }

  const apiGroups = new Map();
  for (const api of apis) {
    const group = apiGroups.get(api.path) ?? [];
    group.push(api);
    apiGroups.set(api.path, group);
  }
  for (const [path, group] of apiGroups) {
    const filePath = join(routeDirectory(join(outputRoot, "api"), path), "route.ts");
    await writeSource(filePath, apiSource(group, filePath));
  }

  const openApiPath = join(outputRoot, "voyzu", "openapi.json", "route.ts");
  const openApiDocument = relativeImport(openApiPath, join(webRoot, ".generated", "api-reference", "openapi.json"));
  await writeSource(openApiPath, `// Generated by voyzu compose. Do not edit.\nimport document from ${JSON.stringify(openApiDocument)};\n\nexport function GET() {\n  return Response.json(document);\n}\n`);

  console.log(`Generated ${pages.length} page routes and ${apiGroups.size} API route files.`);
}

main().catch((error) => {
  console.error(`Route generation failed: ${error.message}`);
  process.exitCode = 1;
});
