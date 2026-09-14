import * as fs from "node:fs";
import * as path from "node:path";
import { resolveHttpApiContracts, httpApiDocSegment, httpApiGroupUrl } from "@voyzu/http-api/contracts";
import type { HttpApiRegistration } from "@voyzu/types/http-api";
import type { HttpApiRouteDefinition } from "@voyzu/types/http-api";
import sampler from "openapi-sampler";
import type { TSchema } from "typebox";
import type { OperationDoc, OperationDocRequestParam } from "../types";
export type { OperationDoc } from "../types";
const DEFAULT_CONTENT_TYPE = "application/json";
export type HttpApiDocumentationRegistration = HttpApiRegistration;
export interface GenerateOperationDocsOptions {
  outputDir: string;
  registrations: readonly HttpApiDocumentationRegistration[];
  workspaceRoot: string;
}
type JsonSchema = Record<string, unknown>;
function jsonType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
function normalizeSchemaValue(value: unknown, ancestors = new WeakSet<object>()): unknown {
  if (Array.isArray(value)) {
    return value.map(item => normalizeSchemaValue(item, ancestors));
  }
  if (!value || typeof value !== "object") return value;
  if (ancestors.has(value)) return {};
  ancestors.add(value);
  const schema = value as Record<string, unknown>;
  const entries = Object.entries(schema).filter(([key]) => key !== "$schema").map(([key, item]) => [key, normalizeSchemaValue(item, ancestors)]);
  ancestors.delete(value);
  const normalized = Object.fromEntries(entries);
  if (!("const" in schema)) return normalized;
  delete normalized.const;
  return {
    type: jsonType(schema.const),
    enum: [schema.const],
    ...normalized
  };
}
function normalizeSchema(schema: TSchema): JsonSchema {
  return normalizeSchemaValue(schema) as JsonSchema;
}
function localDefinitionName(reference: string): string {
  return reference.replace(/^#\/(?:\$defs|definitions)\//, "");
}
function inlineLocalSchemaRefs(value: unknown, definitions = new Map<string, JsonSchema>(), referenceDepth = new Map<string, number>()): unknown {
  if (Array.isArray(value)) {
    return value.map(item => inlineLocalSchemaRefs(item, definitions, referenceDepth));
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
      if (depth > 0) return {
        type: "object"
      };
      const nestedDepth = new Map(referenceDepth);
      nestedDepth.set(name, depth + 1);
      return inlineLocalSchemaRefs(definition, definitions, nestedDepth);
    }
  }
  return Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "$defs" && key !== "definitions").map(([key, item]) => [key, inlineLocalSchemaRefs(item, definitions, referenceDepth)]));
}
function sampleSchema(schema: JsonSchema): unknown {
  try {
    return sampler.sample(inlineLocalSchemaRefs(schema) as never, {
      skipNonRequired: false
    });
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
function parameterDoc(definition: {
  description?: string;
  required?: boolean;
  schema: TSchema;
}, required?: boolean): OperationDocRequestParam {
  const schema = normalizeSchema(definition.schema);
  const example = sampleSchema(schema);
  const isRequired = required ?? definition.required;
  return {
    ...(definition.description ? {
      description: definition.description
    } : {}),
    ...(isRequired !== undefined ? {
      required: isRequired
    } : {}),
    schema,
    ...(example !== undefined ? {
      example
    } : {})
  };
}
function pathParameters(route: HttpApiRouteDefinition): Record<string, OperationDocRequestParam> | undefined {
  if (!route.request?.path) return undefined;
  return Object.fromEntries(Object.entries(route.request.path).map(([name, definition]) => [name, parameterDoc(definition, true)]));
}
function queryParameters(route: HttpApiRouteDefinition): Record<string, OperationDocRequestParam> | undefined {
  const query = route.request?.query;
  if (!query) return undefined;
  const querySchema = normalizeSchema(query.schema);
  const properties = querySchema.properties;
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    throw new Error(`${route.method} ${route.path} query schema must define object properties`);
  }
  const required = new Set(Array.isArray(querySchema.required) ? querySchema.required : []);
  return Object.fromEntries(Object.entries(query.parameters).map(([name, metadata]) => {
    const schema = (properties as Record<string, unknown>)[name];
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      throw new Error(`${route.method} ${route.path} query parameter ${name} has no schema property`);
    }
    return [name, parameterDoc({
      ...metadata,
      schema: schema as TSchema
    }, metadata.required ?? (required.has(name) ? true : undefined))];
  }));
}
function responseDocs(route: HttpApiRouteDefinition): OperationDoc["responses"] {
  return Object.fromEntries(Object.entries(route.responses).map(([status, response]) => {
    const contentType = response.contentType ?? (response.body ? DEFAULT_CONTENT_TYPE : undefined);
    const schema = response.body ? normalizeSchema(response.body) : undefined;
    const example = schema ? sampleSchema(schema) : contentType ? sampleContent(contentType) : undefined;
    return [status, {
      description: response.description,
      ...(contentType ? {
        contentType
      } : {}),
      ...(schema ? {
        schema
      } : {}),
      ...(example !== undefined ? {
        example
      } : {}),
      ...(response.cookies ? {
        cookies: response.cookies
      } : {})
    }];
  }));
}
function toOperationDoc(route: HttpApiRouteDefinition, id: string, description: string, tag: string): OperationDoc {
  const requestBodySchema = route.request?.body ? normalizeSchema(route.request.body) : undefined;
  const requestBodyExample = requestBodySchema ? sampleSchema(requestBodySchema) : undefined;
  const requestPathParams = pathParameters(route);
  const requestQuerystringParams = queryParameters(route);
  return {
    operationId: id,
    method: route.method.toLowerCase() as OperationDoc["method"],
    path: routePathToDocPath(route.path),
    summary: route.summary,
    description,
    tags: [tag],
    ...(requestPathParams ? {
      requestPathParams
    } : {}),
    ...(requestQuerystringParams ? {
      requestQuerystringParams
    } : {}),
    ...(route.request?.cookies ? {
      requestCookies: route.request.cookies
    } : {}),
    ...(requestBodySchema ? {
      requestBody: {
        required: true,
        contentType: route.request?.contentType ?? DEFAULT_CONTENT_TYPE,
        schema: requestBodySchema,
        ...(requestBodyExample !== undefined ? {
          example: requestBodyExample
        } : {})
      }
    } : {}),
    responses: responseDocs(route)
  };
}
function cleanOutputRoot(outputRoot: string): void {
  fs.rmSync(outputRoot, {
    recursive: true,
    force: true
  });
  fs.mkdirSync(outputRoot, {
    recursive: true
  });
}
export function generateOperationDocs(options: GenerateOperationDocsOptions): string[] {
  const resolved = resolveHttpApiContracts(options.registrations);
  const outputRoot = path.resolve(options.workspaceRoot, options.outputDir);
  cleanOutputRoot(outputRoot);
  const writtenFiles: string[] = [];
  const navigation: unknown[] = [];
  const navigationHeadings = new Map<string, { label: string; items: unknown[] }>();
  const tags: {
    name: string;
    description: string;
  }[] = [];
  const emit = (file: string, value: unknown) => {
    fs.mkdirSync(path.dirname(file), {
      recursive: true
    });
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
    writtenFiles.push(file);
  };
  for (const registration of options.registrations) {
    const {
      packageName,
      documentation
    } = registration;
    const packageFolder = packageName.replace("/", "-");
    const sections = Object.entries(documentation.sections);
    if (!sections.length) continue;
    const sectionNavigation: unknown[] = [];
    for (const [sectionId, section] of sections) {
      const tag = packageName + ": " + section.title;
      tags.push({
        name: tag,
        description: section.description
      });
      const groupNavigation: unknown[] = [];
      for (const [groupId, group] of Object.entries(section.groups)) {
        const groupFolder = httpApiDocSegment(groupId);
        const outputDirectory = path.join(outputRoot, packageFolder, groupFolder);
        const url = httpApiGroupUrl(packageName, groupId);
        const operations = Object.entries(group.routes).map(([id, doc]) => {
          const route = resolved.routes.get(id)!;
          const file = httpApiDocSegment(id) + ".operation-doc.json";
          emit(path.join(outputDirectory, file), toOperationDoc(route, id, doc.description, tag));
          return {
            id,
            file,
            summary: route.summary
          };
        });
        emit(path.join(outputDirectory, "group-doc.json"), {
          groupId,
          title: group.title,
          description: group.description,
          sectionId,
          sectionTitle: section.title,
          sectionDescription: section.description,
          operations
        });
        groupNavigation.push({
          label: group.title,
          icon: "article",
          path: url,
          children: operations.map(operation => ({
            label: operation.summary,
            path: url + "#" + httpApiDocSegment(operation.id)
          }))
        });
      }
      if (section.navigationHeadingId) {
        let heading = navigationHeadings.get(section.navigationHeadingId);
        if (!heading) {
          heading = { label: section.title, items: [] };
          navigationHeadings.set(section.navigationHeadingId, heading);
          navigation.push(heading);
        }
        heading.items.push(...groupNavigation);
      } else sectionNavigation.push({
        label: section.title,
        icon: "folder",
        path: `#http-api-section-${sectionId}`,
        children: groupNavigation
      });
    }
    emit(path.join(outputRoot, packageFolder, "package-doc.json"), {
      packageName
    });
    if (sectionNavigation.length) navigation.push({ label: packageName, items: sectionNavigation });
  }
  emit(path.join(outputRoot, "navigation.json"), navigation);
  emit(path.join(outputRoot, "tags.json"), tags);
  return writtenFiles;
}
