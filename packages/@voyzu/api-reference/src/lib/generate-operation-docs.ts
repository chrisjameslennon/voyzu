import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import sampler from "openapi-sampler";
import {
  Node,
  Project,
  SyntaxKind,
  type Expression,
  type ObjectLiteralExpression,
  type PropertyAssignment,
} from "ts-morph";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
const DEFAULT_CONTENT_TYPE = "application/json";

type SchemaNameRef = {
  schemaName: string;
};
type ApiSchema = Record<string, unknown> | SchemaNameRef;

type ApiResponseDefinition = {
  description: string;
  contentType?: string;
  body?: ApiSchema;
  cookies?: Record<
    string,
    {
      description?: string;
      action?: "set" | "clear";
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: string;
      path?: string;
      maxAgeSeconds?: number;
    }
  >;
};

type ApiParameterDefinition = {
  description?: string;
  required?: boolean;
  schema: ApiSchema;
};

type ApiQueryDefinition = {
  parameters: Record<string, Omit<ApiParameterDefinition, "schema">>;
  schema: ApiSchema;
};

type ApiRequestCookieDefinition = {
  description?: string;
  required?: boolean;
  example?: unknown;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
  maxAgeSeconds?: number;
};

type ApiDefinition = {
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tags?: string[];
  request?: {
    path?: Record<string, ApiParameterDefinition>;
    query?: ApiQueryDefinition;
    cookies?: Record<string, ApiRequestCookieDefinition>;
    contentType?: string;
    body?: ApiSchema;
  };
  responses: Record<string, ApiResponseDefinition>;
};

type ModuleApiDefinitions = {
  folderName: string;
  definitions: ApiDefinition[];
};

type PackageApiDefinitions = {
  packageName: string;
  folderName: string;
  modules: ModuleApiDefinitions[];
};

export type OperationDoc = {
  operationId: string;
  method: Lowercase<HttpMethod>;
  path: string;
  summary: string;
  description: string;
  tags?: string[];
  requestPathParams?: Record<
    string,
    {
      description?: string;
      required?: boolean;
      schema: Record<string, unknown>;
      example?: unknown;
    }
  >;
  requestQuerystringParams?: Record<
    string,
    {
      description?: string;
      required?: boolean;
      schema: Record<string, unknown>;
      example?: unknown;
    }
  >;
  requestCookies?: Record<string, ApiRequestCookieDefinition>;
  requestBody?: {
    required?: boolean;
    contentType?: string;
    schemaRef?: SchemaRefDoc;
    schema: Record<string, unknown>;
    example?: unknown;
  };
  responses: Record<
    string,
    {
      description: string;
      contentType?: string;
      schemaRef?: SchemaRefDoc;
      schema?: Record<string, unknown>;
      example?: unknown;
      cookies?: ApiResponseDefinition["cookies"];
    }
  >;
};

export type SchemaRefDoc = string | { type: "array"; items: SchemaRefDoc };

export type DtoDoc = {
  name: string;
  sourceFile: string;
  typescript: string;
};

export type GenerateOperationDocsOptions = {
  workspaceRoot: string;
  outputDir: string;
};

const TYPES_FOLDER_NAME = "types";

class DtoRegistry {
  readonly #workspaceRoot: string;
  readonly #sourceByName = new Map<string, string>();
  readonly #sourceContents = new Map<string, string>();
  readonly #schemaByName = new Map<string, Record<string, unknown>>();
  #temporaryInputsRoot: string | undefined;

  constructor(workspaceRoot: string) {
    this.#workspaceRoot = workspaceRoot;
    this.#indexSources();
  }

  #indexSources(): void {
    const sourceRoots = [
      path.join(this.#workspaceRoot, "lib", "types", "src"),
      path.join(this.#workspaceRoot, "packages"),
      path.join(this.#workspaceRoot, "lib", "modules"),
    ];
    const installedRoot = installedPackagesRoot(this.#workspaceRoot);
    if (installedRoot) sourceRoots.push(installedRoot);

    for (const filePath of sourceRoots.flatMap(listTypeSourceFiles)) {
      const source = fs.readFileSync(filePath, "utf-8");
      this.#sourceContents.set(filePath, source);
      const declarations = source.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\b/g);
      for (const match of declarations) {
        const dtoName = match[1];
        if (dtoName && !this.#sourceByName.has(dtoName)) {
          this.#sourceByName.set(dtoName, filePath);
        }
      }
    }
  }

  sourceFile(dtoName: string): string {
    const sourceFile = this.#sourceByName.get(dtoName);
    if (!sourceFile) {
      throw new Error(`Could not find TypeScript source for DTO ${dtoName}`);
    }
    return sourceFile;
  }

  sourceText(dtoName: string): string {
    const sourceFile = this.sourceFile(dtoName);
    const source = this.#sourceContents.get(sourceFile);
    if (source === undefined) {
      throw new Error(`Could not read TypeScript source for DTO ${dtoName}`);
    }
    return source;
  }

  prepare(dtoNames: ReadonlySet<string>, temporaryInputsRoot: string): void {
    this.#temporaryInputsRoot = temporaryInputsRoot;
    fs.mkdirSync(temporaryInputsRoot, { recursive: true });
    const names = [...dtoNames].sort();
    const inputFile = path.join(temporaryInputsRoot, "typebox-schemas.ts");
    const imports = names.map((dtoName, index) =>
      `import { ${dtoName} as Schema${index} } from ${JSON.stringify(pathToFileURL(this.sourceFile(dtoName)).href)};`
    );
    const entries = names.map((dtoName, index) => `${JSON.stringify(dtoName)}: Schema${index}`);
    fs.writeFileSync(
      inputFile,
      `${imports.join("\n")}\nprocess.stdout.write(JSON.stringify({${entries.join(",")}}));\n`,
      "utf-8",
    );
    const output = execFileSync(process.execPath, ["--import", "tsx", inputFile], {
      cwd: this.#workspaceRoot,
      encoding: "utf-8",
    });
    const schemas = JSON.parse(output) as Record<string, Record<string, unknown>>;
    for (const [name, schema] of Object.entries(schemas)) {
      this.#schemaByName.set(name, rewriteGeneratedSchema(schema) as Record<string, unknown>);
    }
  }

  schema(dtoName: string): Record<string, unknown> {
    const cached = this.#schemaByName.get(dtoName);
    if (cached) return cached;
    throw new Error(`Schema registry was not prepared for DTO ${dtoName}`);
  }

  dispose(): void {
    if (this.#temporaryInputsRoot) {
      fs.rmSync(this.#temporaryInputsRoot, { recursive: true, force: true });
    }
  }
}

function rewriteGeneratedSchema(value: unknown, seen = new WeakSet<object>()): unknown {
  if (Array.isArray(value)) return value.map((item) => rewriteGeneratedSchema(item, seen));
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return {};
  seen.add(value);

  const record = value as Record<string, unknown>;
  if ("const" in record) {
    return {
      type: typeof record.const,
      enum: [record.const],
      ...Object.fromEntries(Object.entries(record).filter(([key]) => key !== "const" && key !== "$schema")),
    };
  }

  const entries = Object.entries(record)
    .filter(([key]) => key !== "$schema")
    .map(([key, item]) => [
      key,
      typeof item === "string" ? item.replace(/#\/definitions\//g, "#/components/schemas/") : rewriteGeneratedSchema(item, seen),
    ]);
  return Object.fromEntries(entries);
}

function isSchemaNameRef(schema: ApiSchema): schema is SchemaNameRef {
  return typeof schema.schemaName === "string";
}

function expandSchema(schema: ApiSchema, dtoRegistry: DtoRegistry): Record<string, unknown> {
  if (isSchemaNameRef(schema)) return dtoRegistry.schema(schema.schemaName);
  if (schema.type === "array" && schema.items && typeof schema.items === "object") {
    return { ...schema, items: expandSchema(schema.items as ApiSchema, dtoRegistry) };
  }
  if (schema.properties && typeof schema.properties === "object") {
    return {
      ...schema,
      properties: Object.fromEntries(Object.entries(schema.properties as Record<string, ApiSchema>)
        .map(([name, property]) => [name, expandSchema(property, dtoRegistry)])),
    };
  }
  if (Array.isArray(schema.anyOf)) {
    return { ...schema, anyOf: schema.anyOf.map((item) => expandSchema(item as ApiSchema, dtoRegistry)) };
  }
  return schema;
}

function schemaRefDoc(schema: ApiSchema): SchemaRefDoc | undefined {
  if (isSchemaNameRef(schema)) return schema.schemaName;
  if (schema.type === "array" && schema.items && typeof schema.items === "object") {
    const itemRef = schemaRefDoc(schema.items as ApiSchema);
    return itemRef ? { type: "array", items: itemRef } : undefined;
  }
  return undefined;
}

function collectSchemaRefs(schemaRef: SchemaRefDoc | undefined, refs: Set<string>): void {
  if (!schemaRef) return;
  if (typeof schemaRef === "string") {
    refs.add(schemaRef);
    return;
  }
  collectSchemaRefs(schemaRef.items, refs);
}

function collectDefinitionDtoRefs(definition: ApiDefinition, refs: Set<string>): void {
  const collect = (schema: ApiSchema | undefined) => {
    if (schema) collectSchemaRefs(schemaRefDoc(schema), refs);
  };
  collect(definition.request?.body);
  for (const response of Object.values(definition.responses)) {
    collect(response.body);
  }
}

function sampleSchema(schema: Record<string, unknown>): unknown {
  return sampler.sample(schema as never, { skipNonRequired: false });
}

function sampleContent(contentType: string): string | undefined {
  if (contentType === DEFAULT_CONTENT_TYPE || contentType.endsWith("+json")) return undefined;
  if (contentType === "application/pdf") return "%PDF-1.7\n% … binary PDF data …";
  if (contentType === "text/csv") return "column_1,column_2\nvalue_1,value_2";
  if (contentType.startsWith("text/")) return `Example ${contentType} response body`;
  return `… binary ${contentType} data …`;
}

function routePathToDocPath(routePath: string): string {
  const openApiPath = routePath.replace(/\[([^\]]+)\]/g, "{$1}");
  return `/api${openApiPath.startsWith("/") ? openApiPath : `/${openApiPath}`}`;
}

function operationName(routePath: string, method: HttpMethod): string {
  const normalizedPath = routePath
    .replace(/^\//, "")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${normalizedPath}-${method.toLowerCase()}`;
}

function fileNameForOperation(routePath: string, method: HttpMethod): string {
  return `${operationName(routePath, method)}.operation-doc.json`;
}

function folderNameForModuleName(moduleName: string): string {
  const name = moduleName
    .replace(/ModuleBase$/, "")
    .replace(/Module$/, "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
  if (name === "companies") return "company";
  return name;
}

function getPropertyName(property: PropertyAssignment): string | null {
  const name = property.getNameNode();
  if (Node.isStringLiteral(name) || Node.isNumericLiteral(name)) return name.getLiteralText();
  return name.getText();
}

function getObjectProperty(object: ObjectLiteralExpression, key: string): Expression | undefined {
  for (const property of object.getProperties()) {
    if (Node.isShorthandPropertyAssignment(property) && property.getName() === key) {
      return property.getNameNode();
    }
    if (!Node.isPropertyAssignment(property)) continue;
    if (getPropertyName(property) === key) return property.getInitializer();
  }
  return undefined;
}

function expressionToValue(expression: Expression, seen = new Set<string>()): unknown {
  if (
    Node.isAsExpression(expression)
    || Node.isSatisfiesExpression(expression)
    || Node.isParenthesizedExpression(expression)
  ) {
    return expressionToValue(expression.getExpression(), seen);
  }
  if (Node.isStringLiteral(expression) || Node.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.getLiteralText();
  }
  if (Node.isNumericLiteral(expression)) return Number(expression.getLiteralText());
  if (expression.getKind() === SyntaxKind.TrueKeyword) return true;
  if (expression.getKind() === SyntaxKind.FalseKeyword) return false;
  if (expression.getKind() === SyntaxKind.NullKeyword) return null;
  if (Node.isIdentifier(expression)) {
    const declaration = expression.getSymbol()?.getDeclarations().find(Node.isVariableDeclaration);
    const initializer = declaration?.getInitializer();
    if (declaration && initializer) {
      const key = `${declaration.getSourceFile().getFilePath()}:${declaration.getStart()}`;
      if (seen.has(key)) return undefined;
      seen.add(key);
      const value = expressionToValue(initializer, seen);
      seen.delete(key);
      return value;
    }
    for (const importDeclaration of expression.getSourceFile().getImportDeclarations()) {
      const imported = importDeclaration.getNamedImports().find(
        (item) => (item.getAliasNode()?.getText() ?? item.getName()) === expression.getText(),
      );
      if (imported) return { schemaName: imported.getName() } satisfies SchemaNameRef;
    }
    return undefined;
  }
  if (Node.isArrayLiteralExpression(expression)) {
    return expression.getElements().map((item) => expressionToValue(item, seen));
  }
  if (Node.isObjectLiteralExpression(expression)) {
    const result: Record<string, unknown> = {};
    for (const property of expression.getProperties()) {
      if (Node.isSpreadAssignment(property)) {
        const spreadValue = expressionToValue(property.getExpression(), seen);
        if (spreadValue && typeof spreadValue === "object" && !Array.isArray(spreadValue)) {
          Object.assign(result, spreadValue);
        }
        continue;
      }
      if (Node.isShorthandPropertyAssignment(property)) {
        result[property.getName()] = expressionToValue(property.getNameNode(), seen);
        continue;
      }
      if (Node.isPropertyAssignment(property)) {
        const name = getPropertyName(property);
        const initializer = property.getInitializer();
        if (name && initializer) result[name] = expressionToValue(initializer, seen);
      }
    }
    return result;
  }
  if (Node.isCallExpression(expression)) {
    const functionName = expression.getExpression().getText();
    const args = expression.getArguments();
    const options = (index: number) => {
      const value = args[index] ? expressionToValue(args[index], seen) : undefined;
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    };
    if (functionName === "Type.String") return { type: "string", ...options(0) };
    if (functionName === "Type.Number") return { type: "number", ...options(0) };
    if (functionName === "Type.Integer") return { type: "integer", ...options(0) };
    if (functionName === "Type.Boolean") return { type: "boolean", ...options(0) };
    if (functionName === "Type.Null") return { type: "null", ...options(0) };
    if (functionName === "Type.Unknown") return { ...options(0) };
    if (functionName === "Type.Literal" && args[0]) {
      const value = expressionToValue(args[0], seen);
      return { type: typeof value, enum: [value], ...options(1) };
    }
    if (functionName === "Type.Array" && args[0]) {
      return { type: "array", items: expressionToValue(args[0], seen), ...options(1) };
    }
    if (functionName === "Type.Union" && args[0]) {
      return { anyOf: expressionToValue(args[0], seen), ...options(1) };
    }
    if (functionName === "Type.Optional" && args[0]) {
      return { __optional: expressionToValue(args[0], seen) };
    }
    if ((functionName === "Type.Object" || functionName === "StrictObject") && args[0]) {
      const properties = expressionToValue(args[0], seen) as Record<string, unknown>;
      const required: string[] = [];
      const unwrapped = Object.fromEntries(Object.entries(properties).map(([name, property]) => {
        if (property && typeof property === "object" && "__optional" in property) {
          return [name, (property as { __optional: unknown }).__optional];
        }
        required.push(name);
        return [name, property];
      }));
      return {
        type: "object",
        properties: unwrapped,
        ...(required.length ? { required } : {}),
        ...options(1),
        ...(functionName === "StrictObject" ? { additionalProperties: false } : {}),
      };
    }
  }
  return undefined;
}

function readStringProperty(object: ObjectLiteralExpression, key: string): string | undefined {
  const value = getObjectProperty(object, key);
  if (!value) return undefined;
  const parsed = expressionToValue(value);
  return typeof parsed === "string" ? parsed : undefined;
}

function readApiDefinition(routeObject: ObjectLiteralExpression): ApiDefinition | undefined {
  const method = readStringProperty(routeObject, "method") as HttpMethod | undefined;
  const routePath = readStringProperty(routeObject, "path");
  const parsed = expressionToValue(routeObject) as ApiDefinition | undefined;
  if (!method || !routePath || !parsed?.responses) return undefined;
  return {
    ...parsed,
    method,
    path: routePath,
    summary: parsed.summary ?? method,
    description: parsed.description ?? parsed.summary ?? method,
  };
}

function unwrapObjectLiteral(
  expression: Expression | undefined,
  sourceFile = expression?.getSourceFile(),
  project?: Project,
): ObjectLiteralExpression | undefined {
  if (!expression) return undefined;
  sourceFile = expression.getSourceFile() ?? sourceFile;
  if (Node.isObjectLiteralExpression(expression)) return expression;
  if (Node.isAsExpression(expression) || Node.isSatisfiesExpression(expression) || Node.isParenthesizedExpression(expression)) {
    return unwrapObjectLiteral(expression.getExpression(), sourceFile, project);
  }
  if (Node.isIdentifier(expression) && sourceFile) {
    const localDeclaration = sourceFile.getVariableDeclaration(expression.getText());
    if (localDeclaration) return unwrapObjectLiteral(localDeclaration.getInitializer(), sourceFile, project);
    if (project) {
      for (const importDeclaration of sourceFile.getImportDeclarations()) {
        const imported = importDeclaration.getNamedImports().find(
          (item) => (item.getAliasNode()?.getText() ?? item.getName()) === expression.getText(),
        );
        if (!imported) continue;
        const importedPath = resolveTypeScriptModule(
          path.dirname(sourceFile.getFilePath()),
          importDeclaration.getModuleSpecifierValue(),
        );
        const importedSource = project.addSourceFileAtPath(importedPath);
        return unwrapObjectLiteral(
          importedSource.getVariableDeclaration(imported.getName())?.getInitializer(),
          importedSource,
          project,
        );
      }
    }
  }
  return undefined;
}

function resolveTypeScriptModule(packageDirectory: string, moduleSpecifier: string): string {
  const unresolved = path.resolve(packageDirectory, moduleSpecifier);
  const candidates = [unresolved, `${unresolved}.ts`, `${unresolved}.tsx`, path.join(unresolved, "index.ts")];
  const resolved = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!resolved) throw new Error(`Could not resolve package module ${moduleSpecifier} from ${packageDirectory}`);
  return resolved;
}

function registeredModules(packageDirectory: string, project: Project): Array<{ name: string; filePath: string }> {
  const packageDefinitionPath = path.join(packageDirectory, "voyzu.package.ts");
  const sourceFile = project.addSourceFileAtPath(packageDefinitionPath);
  const packageObject = sourceFile.getVariableDeclarations()
    .map((declaration) => unwrapObjectLiteral(declaration.getInitializer()))
    .find((definition) => definition && getObjectProperty(definition, "modules"));
  if (!packageObject) throw new Error(`Could not read modules from ${packageDefinitionPath}`);
  const modules = getObjectProperty(packageObject, "modules");
  if (!modules || !Node.isArrayLiteralExpression(modules)) {
    throw new Error(`${packageDefinitionPath} modules must be an array literal`);
  }

  return modules.getElements().map((element) => {
    if (!Node.isIdentifier(element)) {
      throw new Error(`${packageDefinitionPath} modules must contain imported module identifiers`);
    }
    const localName = element.getText();
    for (const declaration of sourceFile.getImportDeclarations()) {
      const imported = declaration.getNamedImports().find(
        (namedImport) => (namedImport.getAliasNode()?.getText() ?? namedImport.getName()) === localName,
      );
      if (!imported) continue;
      return {
        name: imported.getName(),
        filePath: resolveTypeScriptModule(packageDirectory, declaration.getModuleSpecifierValue()),
      };
    }
    throw new Error(`Could not resolve registered module ${localName} from ${packageDefinitionPath}`);
  });
}

function moduleApiDefinitions(
  filePath: string,
  moduleName: string,
  project: Project,
): ModuleApiDefinitions | undefined {
  const sourceFile = project.addSourceFileAtPath(filePath);
  const declaration = sourceFile.getVariableDeclaration(moduleName);
  const objectInitializer = unwrapObjectLiteral(declaration?.getInitializer(), sourceFile, project);
  if (!objectInitializer) throw new Error(`Could not read module ${moduleName} from ${filePath}`);
  const apiDefinitionsExpression = getObjectProperty(objectInitializer, "apiDefinitions");
  const apiDefinitionsObject = unwrapObjectLiteral(apiDefinitionsExpression, sourceFile, project);
  if (!apiDefinitionsObject) return undefined;
  const definitions = apiDefinitionsObject.getProperties().flatMap((property) => {
    if (!Node.isPropertyAssignment(property)) return [];
    const routeObject = property.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    if (!routeObject) return [];
    const definition = readApiDefinition(routeObject);
    return definition ? [definition] : [];
  });
  return definitions.length > 0
    ? { folderName: folderNameForModuleName(moduleName), definitions }
    : undefined;
}

function packageDirectories(packagesRoot: string): string[] {
  if (!fs.existsSync(packagesRoot)) return [];
  return fs.readdirSync(packagesRoot, { withFileTypes: true })
    .filter((scope) => scope.isDirectory() && scope.name.startsWith("@"))
    .flatMap((scope) => {
      const scopeRoot = path.join(packagesRoot, scope.name);
      return fs.readdirSync(scopeRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
        .map((entry) => path.join(scopeRoot, entry.name));
    });
}

function installedPackagesRoot(workspaceRoot: string): string | undefined {
  const runtimeRoot = path.dirname(workspaceRoot);
  const runtimeManifest = path.join(runtimeRoot, "package.json");
  if (path.basename(workspaceRoot) !== "voyzu" || !fs.existsSync(runtimeManifest)) return undefined;
  const instanceManifest = path.join(path.dirname(runtimeRoot), "package.json");
  if (!fs.existsSync(instanceManifest)) {
    throw new Error("A Voyzu installation must have a root package.json.");
  }
  const manifest = JSON.parse(fs.readFileSync(instanceManifest, "utf-8")) as { voyzu?: { mode?: string } };
  if (manifest.voyzu?.mode !== "development" && manifest.voyzu?.mode !== "production") {
    throw new Error("The root package.json must declare voyzu.mode as development or production.");
  }
  return path.join(runtimeRoot, "packages");
}

function packageFolderName(packageName: string): string {
  return packageName.replace("/", "-");
}

function readPackageApiDefinitions(workspaceRoot: string): PackageApiDefinitions[] {
  const project = new Project({
    tsConfigFilePath: path.join(workspaceRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });
  const roots = [path.join(workspaceRoot, "packages")];
  const installedRoot = installedPackagesRoot(workspaceRoot);
  if (installedRoot) roots.push(installedRoot);

  const packages = roots.flatMap(packageDirectories).flatMap((directory) => {
    const manifestPath = path.join(directory, "package.json");
    const definitionPath = path.join(directory, "voyzu.package.ts");
    if (!fs.existsSync(manifestPath) || !fs.existsSync(definitionPath)) return [];
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as {
      name?: string;
      voyzu?: { "voyzu-package"?: boolean };
    };
    if (manifest.voyzu?.["voyzu-package"] !== true || !manifest.name) return [];
    const modules = registeredModules(directory, project)
      .map(({ filePath, name }) => moduleApiDefinitions(filePath, name, project))
      .filter((definition): definition is ModuleApiDefinitions => Boolean(definition));
    return modules.length
      ? [{ packageName: manifest.name, folderName: packageFolderName(manifest.name), modules }]
      : [];
  });

  const platformManifest = JSON.parse(
    fs.readFileSync(path.join(workspaceRoot, "lib", "api", "package.json"), "utf-8"),
  ) as { name: string };
  const capabilityModulePath = path.join(workspaceRoot, "lib", "api", "src", "capability.module.ts");
  const capabilityDefinition = moduleApiDefinitions(
    capabilityModulePath,
    "capabilityModule",
    project,
  );
  const platformModules = capabilityDefinition ? [capabilityDefinition] : [];
  if (platformModules.length) {
    packages.push({
      packageName: platformManifest.name,
      folderName: packageFolderName(platformManifest.name),
      modules: platformModules,
    });
  }
  return packages;
}

function toOperationDoc(
  definition: ApiDefinition,
  dtoRefs: Set<string>,
  dtoRegistry: DtoRegistry,
): OperationDoc {
  const requestPathParams = definition.request?.path
    ? expandParameters(definition.request.path, dtoRegistry)
    : undefined;
  const requestQuerystringParams = definition.request?.query
    ? expandQueryParameters(definition.request.query)
    : undefined;
  const requestSchema = definition.request?.body
    ? expandSchema(definition.request.body, dtoRegistry)
    : undefined;
  const requestSchemaRef = definition.request?.body ? schemaRefDoc(definition.request.body) : undefined;
  collectSchemaRefs(requestSchemaRef, dtoRefs);
  const responses = Object.fromEntries(
    Object.entries(definition.responses).map(([status, response]) => {
      const contentType = response.contentType ?? DEFAULT_CONTENT_TYPE;
      const responseSchema = response.body ? expandSchema(response.body, dtoRegistry) : undefined;
      const responseSchemaRef = response.body ? schemaRefDoc(response.body) : undefined;
      collectSchemaRefs(responseSchemaRef, dtoRefs);
      return [
        status,
        {
          description: response.description,
          contentType,
          ...(responseSchemaRef ? { schemaRef: responseSchemaRef } : {}),
          ...(responseSchema
            ? { schema: responseSchema, example: sampleSchema(responseSchema) }
            : status !== "204" && sampleContent(contentType) !== undefined
              ? { example: sampleContent(contentType) }
              : {}),
          ...(response.cookies ? { cookies: response.cookies } : {}),
        },
      ];
    }),
  );

  return {
    operationId: operationName(definition.path, definition.method),
    method: definition.method.toLowerCase() as Lowercase<HttpMethod>,
    path: routePathToDocPath(definition.path),
    summary: definition.summary,
    description: definition.description,
    ...(definition.tags ? { tags: definition.tags } : {}),
    ...(requestPathParams ? { requestPathParams } : {}),
    ...(requestQuerystringParams ? { requestQuerystringParams } : {}),
    ...(definition.request?.cookies ? { requestCookies: definition.request.cookies } : {}),
    ...(definition.request?.body && requestSchema
      ? {
        requestBody: {
          required: true,
          contentType: definition.request.contentType ?? DEFAULT_CONTENT_TYPE,
          ...(requestSchemaRef ? { schemaRef: requestSchemaRef } : {}),
          schema: requestSchema,
          example: sampleSchema(requestSchema),
        },
      }
      : {}),
    responses,
  };
}

function expandParameters(
  parameters: Record<string, ApiParameterDefinition>,
  dtoRegistry: DtoRegistry,
): Record<string, { description?: string; required?: boolean; schema: Record<string, unknown>; example?: unknown }> {
  return Object.fromEntries(
    Object.entries(parameters).map(([name, parameter]) => {
      const schema = expandSchema(parameter.schema, dtoRegistry);
      return [
        name,
        {
          ...(parameter.description ? { description: parameter.description } : {}),
          ...(parameter.required !== undefined ? { required: parameter.required } : {}),
          schema,
          example: sampleSchema(schema),
        },
      ];
    }),
  );
}

function expandQueryParameters(
  query: ApiQueryDefinition,
): Record<string, { description?: string; required?: boolean; schema: Record<string, unknown>; example?: unknown }> {
  const properties = !isSchemaNameRef(query.schema) && query.schema.properties
    ? query.schema.properties as Record<string, ApiSchema>
    : {};
  return Object.fromEntries(
    Object.entries(query.parameters).map(([name, parameter]) => {
      const schema = properties[name];
      if (!schema) throw new Error(`Could not find query parameter ${name} in its TypeBox schema`);
      return [
        name,
        {
          ...(parameter.description ? { description: parameter.description } : {}),
          ...(parameter.required !== undefined ? { required: parameter.required } : {}),
          schema: schema as Record<string, unknown>,
          example: sampleSchema(schema as Record<string, unknown>),
        },
      ];
    }),
  );
}

function cleanOutputDir(outputDir: string, extension = ".operation-doc.json"): void {
  fs.mkdirSync(outputDir, { recursive: true });
  for (const fileName of fs.readdirSync(outputDir)) {
    const filePath = path.join(outputDir, fileName);
    if (fs.statSync(filePath).isFile() && fileName.endsWith(extension)) {
      fs.unlinkSync(filePath);
    }
  }
}

function cleanGeneratedOperationDocsRoot(outputRoot: string): void {
  fs.mkdirSync(outputRoot, { recursive: true });
  for (const entry of fs.readdirSync(outputRoot, { withFileTypes: true })) {
    const entryPath = path.join(outputRoot, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(entryPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(entryPath);
    }
  }
}

function listTypeSourceFiles(typesRoot: string): string[] {
  if (!fs.existsSync(typesRoot)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(typesRoot, { withFileTypes: true })) {
    if (["node_modules", ".next", ".generated"].includes(entry.name)) continue;
    const entryPath = path.join(typesRoot, entry.name);
    if (
      entry.isDirectory()
      || (entry.isSymbolicLink() && fs.statSync(entryPath).isDirectory())
    ) {
      results.push(...listTypeSourceFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      results.push(entryPath);
    }
  }
  return results;
}

function dtoDocFor(dtoName: string, workspaceRoot: string, dtoRegistry: DtoRegistry): DtoDoc {
  const sourceFile = dtoRegistry.sourceFile(dtoName);
  return {
    name: dtoName,
    sourceFile: path.relative(workspaceRoot, sourceFile).replace(/\\/g, "/"),
    typescript: dtoRegistry.sourceText(dtoName),
  };
}

function fileNameForDto(dtoName: string): string {
  return `${dtoName}.dto-doc.json`;
}

function writeDtoDocs(
  dtoRefs: Set<string>,
  workspaceRoot: string,
  outputRoot: string,
  dtoRegistry: DtoRegistry,
): string[] {
  const outputDir = path.join(outputRoot, TYPES_FOLDER_NAME);
  cleanOutputDir(outputDir, ".dto-doc.json");
  const writtenFiles: string[] = [];
  for (const dtoName of Array.from(dtoRefs).sort()) {
    const outputPath = path.join(outputDir, fileNameForDto(dtoName));
    fs.writeFileSync(
      outputPath,
      `${JSON.stringify(dtoDocFor(dtoName, workspaceRoot, dtoRegistry), null, 2)}\n`,
      "utf-8",
    );
    writtenFiles.push(outputPath);
  }
  return writtenFiles;
}

export function generateOperationDocs(options: GenerateOperationDocsOptions): string[] {
  const outputRoot = path.resolve(options.workspaceRoot, options.outputDir);
  const previousCwd = process.cwd();
  let dtoRegistry: DtoRegistry | undefined;
  process.chdir(options.workspaceRoot);
  try {
    cleanGeneratedOperationDocsRoot(outputRoot);
    const packageDefinitions = readPackageApiDefinitions(options.workspaceRoot).sort((a, b) =>
      a.packageName.localeCompare(b.packageName)
    );
    const allDtoRefs = new Set<string>();
    for (const packageDefinition of packageDefinitions) {
      for (const moduleDefinition of packageDefinition.modules) {
        for (const definition of moduleDefinition.definitions) {
          collectDefinitionDtoRefs(definition, allDtoRefs);
        }
      }
    }
    dtoRegistry = new DtoRegistry(options.workspaceRoot);
    dtoRegistry.prepare(
      allDtoRefs,
      path.join(outputRoot, ".schema-inputs"),
    );
    const writtenFiles: string[] = [];
    for (const packageDefinition of packageDefinitions) {
      const packageOutputDir = path.join(outputRoot, packageDefinition.folderName);
      fs.mkdirSync(packageOutputDir, { recursive: true });
      const packageDocPath = path.join(packageOutputDir, "package-doc.json");
      fs.writeFileSync(
        packageDocPath,
        `${JSON.stringify({ packageName: packageDefinition.packageName }, null, 2)}\n`,
        "utf-8",
      );
      writtenFiles.push(packageDocPath);
      const dtoRefs = new Set<string>();
      for (const { folderName, definitions } of packageDefinition.modules.sort((a, b) =>
        a.folderName.localeCompare(b.folderName),
      )) {
        const outputDir = path.join(packageOutputDir, folderName);
        cleanOutputDir(outputDir);
        for (const definition of definitions) {
          const doc = toOperationDoc(definition, dtoRefs, dtoRegistry);
          const outputPath = path.join(outputDir, fileNameForOperation(definition.path, definition.method));
          fs.writeFileSync(outputPath, `${JSON.stringify(doc, null, 2)}\n`, "utf-8");
          writtenFiles.push(outputPath);
        }
      }
      writtenFiles.push(...writeDtoDocs(
        dtoRefs,
        options.workspaceRoot,
        packageOutputDir,
        dtoRegistry,
      ));
    }
    return writtenFiles;
  } finally {
    dtoRegistry?.dispose();
    process.chdir(previousCwd);
  }
}
