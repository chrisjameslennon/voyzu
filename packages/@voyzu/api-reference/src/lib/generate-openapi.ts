import * as fs from "node:fs";
import * as path from "node:path";

import type { OperationDoc } from "../types";

type OpenApiSchema = Record<string, unknown>;

interface GenerateOpenApiOptions {
  workspaceRoot: string;
  operationDocsDir: string;
  outputFile: string;
  title?: string;
  version?: string;
  excludeFolders?: string[];
}

interface OpenApiParameter {
  name: string;
  in: "path" | "query" | "cookie";
  required?: boolean;
  description?: string;
  schema: OpenApiSchema;
  example?: unknown;
}

interface OpenApiOperation {
  operationId: string;
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: OpenApiSchema; example?: unknown }>;
  };
  responses: Record<
    string,
    {
      description: string;
      headers?: Record<string, { description?: string; schema: OpenApiSchema; example?: unknown }>;
      content?: Record<string, { schema: OpenApiSchema; example?: unknown }>;
    }
  >;
}

function readOperationDocs(inputRoot: string, excludeFolders: Set<string>): OperationDoc[] {
  if (!fs.existsSync(inputRoot)) return [];

  function visit(directory: string): OperationDoc[] {
    return fs.readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "types" || excludeFolders.has(entry.name)) return [];
          return visit(entryPath);
        }
        if (!entry.isFile() || !entry.name.endsWith(".operation-doc.json")) return [];
        return [JSON.parse(fs.readFileSync(entryPath, "utf-8")) as OperationDoc];
      });
  }

  return visit(inputRoot)
    .sort(
      (a, b) =>
        a.path.localeCompare(b.path) ||
        a.method.localeCompare(b.method) ||
        a.operationId.localeCompare(b.operationId),
    );
}

function responseContentType(response: OperationDoc["responses"][string]): string {
  return response.contentType ?? "application/json";
}

function binarySchemaFor(contentType: string): OpenApiSchema | undefined {
  if (contentType === "application/json") return undefined;
  return {
    type: "string",
    format: "binary",
  };
}

function toParameters(doc: OperationDoc): OpenApiParameter[] | undefined {
  const pathParams = Object.entries(doc.requestPathParams ?? {}).map(([name, param]) => ({
    name,
    in: "path" as const,
    required: true,
    ...(param.description ? { description: param.description } : {}),
    schema: param.schema as OpenApiSchema,
    ...(param.example !== undefined ? { example: param.example } : {}),
  }));

  const queryParams = Object.entries(doc.requestQuerystringParams ?? {}).map(([name, param]) => ({
    name,
    in: "query" as const,
    ...(param.required !== undefined ? { required: param.required } : {}),
    ...(param.description ? { description: param.description } : {}),
    schema: param.schema as OpenApiSchema,
    ...(param.example !== undefined ? { example: param.example } : {}),
  }));

  const cookieParams = Object.entries(doc.requestCookies ?? {}).map(([name, cookie]) => ({
    name,
    in: "cookie" as const,
    ...(cookie.required !== undefined ? { required: cookie.required } : {}),
    ...(cookie.description ? { description: cookie.description } : {}),
    schema: { type: "string" },
    ...(cookie.example !== undefined ? { example: cookie.example } : {}),
  }));

  const parameters = [...pathParams, ...queryParams, ...cookieParams];
  return parameters.length ? parameters : undefined;
}

function toOpenApiOperation(doc: OperationDoc): OpenApiOperation {
  const responses = Object.fromEntries(
    Object.entries(doc.responses).map(([status, response]) => {
      const contentType = responseContentType(response);
      const schema = response.schema ?? binarySchemaFor(contentType);
      const cookies = Object.entries(response.cookies ?? {});
      const setCookieHeader = cookies.length
        ? {
          "Set-Cookie": {
            description: cookies
              .map(([name, cookie]) => `${name}: ${cookie.description ?? "Response cookie."}`)
              .join(" "),
            schema: { type: "string" },
          },
        }
        : undefined;
      return [
        status,
        {
          description: response.description,
          ...(setCookieHeader ? { headers: setCookieHeader } : {}),
          ...(schema
            ? {
              content: {
                [contentType]: {
                  schema: schema as OpenApiSchema,
                  ...(response.example !== undefined ? { example: response.example } : {}),
                },
              },
            }
            : {}),
        },
      ];
    }),
  );

  return {
    operationId: doc.operationId,
    summary: doc.summary,
    ...(doc.description ? { description: doc.description } : {}),
    ...(doc.tags ? { tags: doc.tags } : {}),
    ...(toParameters(doc) ? { parameters: toParameters(doc) } : {}),
    ...(doc.requestBody
      ? {
        requestBody: {
          required: doc.requestBody.required,
          content: {
            [doc.requestBody.contentType ?? "application/json"]: {
              schema: doc.requestBody.schema as OpenApiSchema,
              ...(doc.requestBody.example !== undefined ? { example: doc.requestBody.example } : {}),
            },
          },
        },
      }
      : {}),
    responses,
  };
}

function tagsFor(docs: OperationDoc[]): Array<{ name: string }> {
  return Array.from(new Set(docs.flatMap((doc) => doc.tags ?? [])))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name }));
}

export function generateOpenApi(options: GenerateOpenApiOptions): string {
  const inputRoot = path.resolve(options.workspaceRoot, options.operationDocsDir);
  const outputFile = path.resolve(options.workspaceRoot, options.outputFile);
  const docs = readOperationDocs(inputRoot, new Set(options.excludeFolders ?? []));

  const paths: Record<string, Record<string, OpenApiOperation>> = {};
  for (const doc of docs) {
    paths[doc.path] ??= {};
    paths[doc.path][doc.method] = toOpenApiOperation(doc);
  }

  const openApi = {
    openapi: "3.1.0",
    info: {
      title: options.title ?? "Voyzu API",
      version: options.version ?? "1.0.0",
    },
    tags: tagsFor(docs),
    paths,
  };

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(openApi, null, 2)}\n`, "utf-8");
  return outputFile;
}
