import * as fs from "node:fs";
import * as path from "node:path";

import type { ApiRouteDefinition } from "@voyzu/types/api";
import sampler from "openapi-sampler";
import type { TSchema } from "typebox";

import type {
  OperationDoc,
  OperationDocRequestParam,
} from "../types";

export type { OperationDoc } from "../types";

const DEFAULT_CONTENT_TYPE = "application/json";

export interface ApiDocumentationRegistration {
  packageName: string;
  moduleName: string;
  routes: readonly ApiRouteDefinition[];
}

export interface GenerateOperationDocsOptions {
  outputDir: string;
  registrations: readonly ApiDocumentationRegistration[];
  workspaceRoot: string;
}

type JsonSchema = Record<string, unknown>;

function jsonType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function normalizeSchemaValue(
  value: unknown,
  ancestors = new WeakSet<object>(),
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSchemaValue(item, ancestors));
  }
  if (!value || typeof value !== "object") return value;
  if (ancestors.has(value)) return {};
  ancestors.add(value);

  const schema = value as Record<string, unknown>;
  const entries = Object.entries(schema)
    .filter(([key]) => key !== "$schema")
    .map(([key, item]) => [key, normalizeSchemaValue(item, ancestors)]);
  ancestors.delete(value);

  const normalized = Object.fromEntries(entries);
  if (!("const" in schema)) return normalized;
  delete normalized.const;
  return {
    type: jsonType(schema.const),
    enum: [schema.const],
    ...normalized,
  };
}

function normalizeSchema(schema: TSchema): JsonSchema {
  return normalizeSchemaValue(schema) as JsonSchema;
}

function localDefinitionName(reference: string): string {
  return reference.replace(/^#\/(?:\$defs|definitions)\//, "");
}

function inlineLocalSchemaRefs(
  value: unknown,
  definitions = new Map<string, JsonSchema>(),
  referenceDepth = new Map<string, number>(),
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => inlineLocalSchemaRefs(item, definitions, referenceDepth));
  }
  if (!value || typeof value !== "object") return value;

  const schema = value as JsonSchema;
  for (const definitionKey of ["$defs", "definitions"] as const) {
    const localDefinitions = schema[definitionKey];
    if (!localDefinitions || typeof localDefinitions !== "object" || Array.isArray(localDefinitions)) {
      continue;
    }
    for (const [name, definition] of Object.entries(localDefinitions)) {
      if (definition && typeof definition === "object" && !Array.isArray(definition)) {
        definitions.set(name, definition as JsonSchema);
      }
    }
  }

  if (typeof schema.$ref === "string") {
    const name = localDefinitionName(schema.$ref);
    const definition = definitions.get(name);
    if (definition) {
      const depth = referenceDepth.get(name) ?? 0;
      if (depth > 0) return { type: "object" };
      const nestedDepth = new Map(referenceDepth);
      nestedDepth.set(name, depth + 1);
      return inlineLocalSchemaRefs(definition, definitions, nestedDepth);
    }
  }

  return Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) => key !== "$defs" && key !== "definitions")
      .map(([key, item]) => [
        key,
        inlineLocalSchemaRefs(item, definitions, referenceDepth),
      ]),
  );
}

function sampleSchema(schema: JsonSchema): unknown {
  try {
    return sampler.sample(
      inlineLocalSchemaRefs(schema) as never,
      { skipNonRequired: false },
    );
  } catch {
    return undefined;
  }
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

function operationName(routePath: string, method: string): string {
  const normalizedPath = routePath
    .replace(/^\//, "")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${normalizedPath}-${method.toLowerCase()}`;
}

function fileNameForOperation(route: ApiRouteDefinition): string {
  return `${operationName(route.path, route.method)}.operation-doc.json`;
}

function packageFolderName(packageName: string): string {
  return packageName.replace("/", "-");
}

function moduleFolderName(moduleName: string): string {
  const folderName = moduleName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!folderName) throw new Error(`Invalid API module name: ${moduleName}`);
  return folderName;
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function operationAnchor(summary: string): string {
  return summary
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function parameterDoc(
  definition: { description?: string; required?: boolean; schema: TSchema },
  required?: boolean,
): OperationDocRequestParam {
  const schema = normalizeSchema(definition.schema);
  const example = sampleSchema(schema);
  const isRequired = required ?? definition.required;
  return {
    ...(definition.description ? { description: definition.description } : {}),
    ...(isRequired !== undefined ? { required: isRequired } : {}),
    schema,
    ...(example !== undefined ? { example } : {}),
  };
}

function pathParameters(route: ApiRouteDefinition): Record<string, OperationDocRequestParam> | undefined {
  if (!route.request?.path) return undefined;
  return Object.fromEntries(
    Object.entries(route.request.path).map(([name, definition]) => [
      name,
      parameterDoc(definition, true),
    ]),
  );
}

function queryParameters(route: ApiRouteDefinition): Record<string, OperationDocRequestParam> | undefined {
  const query = route.request?.query;
  if (!query) return undefined;
  const querySchema = normalizeSchema(query.schema);
  const properties = querySchema.properties;
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    throw new Error(`${route.method} ${route.path} query schema must define object properties`);
  }
  const required = new Set(Array.isArray(querySchema.required) ? querySchema.required : []);
  return Object.fromEntries(
    Object.entries(query.parameters).map(([name, metadata]) => {
      const schema = (properties as Record<string, unknown>)[name];
      if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        throw new Error(`${route.method} ${route.path} query parameter ${name} has no schema property`);
      }
      return [
        name,
        parameterDoc(
          { ...metadata, schema: schema as TSchema },
          metadata.required ?? (required.has(name) ? true : undefined),
        ),
      ];
    }),
  );
}

function responseDocs(route: ApiRouteDefinition): OperationDoc["responses"] {
  return Object.fromEntries(
    Object.entries(route.responses).map(([status, response]) => {
      const contentType = response.contentType ?? DEFAULT_CONTENT_TYPE;
      const schema = response.body ? normalizeSchema(response.body) : undefined;
      const example = schema ? sampleSchema(schema) : sampleContent(contentType);
      return [
        status,
        {
          description: response.description,
          contentType,
          ...(schema ? { schema } : {}),
          ...(example !== undefined ? { example } : {}),
          ...(response.cookies ? { cookies: response.cookies } : {}),
        },
      ];
    }),
  );
}

function toOperationDoc(route: ApiRouteDefinition): OperationDoc {
  const requestBodySchema = route.request?.body
    ? normalizeSchema(route.request.body)
    : undefined;
  const requestBodyExample = requestBodySchema
    ? sampleSchema(requestBodySchema)
    : undefined;
  const requestPathParams = pathParameters(route);
  const requestQuerystringParams = queryParameters(route);

  return {
    operationId: operationName(route.path, route.method),
    method: route.method.toLowerCase() as OperationDoc["method"],
    path: routePathToDocPath(route.path),
    summary: route.summary,
    description: route.description,
    ...(route.tags ? { tags: [...route.tags] } : {}),
    ...(requestPathParams ? { requestPathParams } : {}),
    ...(requestQuerystringParams ? { requestQuerystringParams } : {}),
    ...(route.request?.cookies ? { requestCookies: route.request.cookies } : {}),
    ...(requestBodySchema
      ? {
        requestBody: {
          required: true,
          contentType: route.request?.contentType ?? DEFAULT_CONTENT_TYPE,
          schema: requestBodySchema,
          ...(requestBodyExample !== undefined ? { example: requestBodyExample } : {}),
        },
      }
      : {}),
    responses: responseDocs(route),
  };
}

function cleanOutputRoot(outputRoot: string): void {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });
}

function validateRegistrations(registrations: readonly ApiDocumentationRegistration[]): void {
  const moduleKeys = new Set<string>();
  const routeKeys = new Set<string>();
  for (const registration of registrations) {
    if (!registration.packageName || !registration.moduleName) {
      throw new Error("API documentation registrations require packageName and moduleName");
    }
    const moduleKey = `${registration.packageName}/${registration.moduleName}`;
    if (moduleKeys.has(moduleKey)) {
      throw new Error(`Duplicate API documentation module: ${moduleKey}`);
    }
    moduleKeys.add(moduleKey);
    for (const route of registration.routes) {
      const key = `${route.method} ${route.path}`;
      if (routeKeys.has(key)) throw new Error(`Duplicate documented API route: ${key}`);
      routeKeys.add(key);
      if (route.handler || typeof route.loadHandler !== "function") {
        throw new Error(`${key} must use a lazy loadHandler`);
      }
      if (!route.summary || !route.description || !route.responses) {
        throw new Error(`${key} is missing required API documentation`);
      }
    }
  }
}

export function generateOperationDocs(options: GenerateOperationDocsOptions): string[] {
  validateRegistrations(options.registrations);
  const outputRoot = path.resolve(options.workspaceRoot, options.outputDir);
  cleanOutputRoot(outputRoot);

  const packages = Map.groupBy(
    [...options.registrations].sort((left, right) =>
      left.packageName.localeCompare(right.packageName)
      || left.moduleName.localeCompare(right.moduleName)
    ),
    ({ packageName }) => packageName,
  );
  const writtenFiles: string[] = [];
  const navigationGroups: Array<{
    label: string;
    items: Array<{
      label: string;
      icon: string;
      path: string;
      children: Array<{ label: string; path: string }>;
    }>;
  }> = [];

  for (const [packageName, registrations] of packages) {
    const packageOutputDir = path.join(outputRoot, packageFolderName(packageName));
    fs.mkdirSync(packageOutputDir, { recursive: true });
    const packageDocPath = path.join(packageOutputDir, "package-doc.json");
    fs.writeFileSync(
      packageDocPath,
      `${JSON.stringify({ packageName }, null, 2)}\n`,
      "utf-8",
    );
    writtenFiles.push(packageDocPath);

    const packageNavigation = {
      label: packageName,
      items: [] as Array<{
        label: string;
        icon: string;
        path: string;
        children: Array<{ label: string; path: string }>;
      }>,
    };

    for (const registration of registrations) {
      const moduleOutputDir = path.join(
        packageOutputDir,
        moduleFolderName(registration.moduleName),
      );
      fs.mkdirSync(moduleOutputDir, { recursive: true });
      const modulePath = `/api-reference/${packageFolderName(packageName)}/${moduleFolderName(registration.moduleName)}`;
      const sortedRoutes = [...registration.routes].sort((left, right) =>
        left.path.localeCompare(right.path) || left.method.localeCompare(right.method)
      );
      for (const route of sortedRoutes) {
        const outputPath = path.join(moduleOutputDir, fileNameForOperation(route));
        fs.writeFileSync(
          outputPath,
          `${JSON.stringify(toOperationDoc(route), null, 2)}\n`,
          "utf-8",
        );
        writtenFiles.push(outputPath);
      }
      const navigationRoutes = [...registration.routes].sort((left, right) =>
        left.summary.localeCompare(right.summary)
        || left.path.localeCompare(right.path)
        || left.method.localeCompare(right.method)
      );
      packageNavigation.items.push({
        label: packageName === "@voyzu/audit"
          ? "Audit"
          : navigationRoutes[0]?.tags?.[0] ?? titleCase(registration.moduleName),
        icon: "article",
        path: modulePath,
        children: navigationRoutes.map((route) => ({
          label: route.summary,
          path: `${modulePath}#${operationAnchor(route.summary)}`,
        })),
      });
    }
    navigationGroups.push(packageNavigation);
  }

  const navigationPath = path.join(outputRoot, "navigation.json");
  fs.writeFileSync(
    navigationPath,
    `${JSON.stringify(navigationGroups, null, 2)}\n`,
    "utf-8",
  );
  writtenFiles.push(navigationPath);

  return writtenFiles;
}
