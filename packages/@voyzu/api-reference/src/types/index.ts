import type { JsonSchema } from "@voyzu/ui-components";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestExampleData {
  method: ApiMethod;
  path: string;
  code: string;
  format?: "shell";
}

export interface ResponseExampleData {
  status: "200" | "201" | "204" | "400" | "409" | "500";
  code: string;
  contentType?: string;
  format?: "json" | "text";
}

export interface ApiPropertiesPanelData {
  heading: string;
  schema?: JsonSchema;
  message?: string;
}

export interface ApiResponsePanelData extends ApiPropertiesPanelData {
  status: "200" | "201" | "400" | "409" | "500";
}

export interface ApiOperationData {
  id: string;
  title: string;
  method: ApiMethod;
  path: string;
  description: string;
  request: {
    panel: ApiPropertiesPanelData;
    example: RequestExampleData;
  };
  responses: {
    panels: ApiResponsePanelData[];
    example: ResponseExampleData;
  };
}

export interface ApiPageData {
  eyebrow: string;
  title: string;
  resourcePath: string;
  description: string;
  operations: ApiOperationData[];
}

export type OperationDocMethod = "get" | "post" | "put" | "patch" | "delete";
export type SchemaRefDoc = string | { type: "array"; items: SchemaRefDoc };

export interface DtoDoc {
  name: string;
  sourceFile: string;
  typescript: string;
}

export interface OperationDocRequestBody {
  required?: boolean;
  contentType?: string;
  schemaRef?: SchemaRefDoc;
  schema: JsonSchema;
  example?: unknown;
}

export interface OperationDocRequestParam {
  description?: string;
  schema: JsonSchema;
  example?: unknown;
}

export interface OperationDocRequestCookie {
  description?: string;
  required?: boolean;
  example?: unknown;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
  maxAgeSeconds?: number;
}

export interface OperationDocResponse {
  description: string;
  contentType?: string;
  schemaRef?: SchemaRefDoc;
  schema?: JsonSchema;
  example?: unknown;
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
}

export interface OperationDoc {
  operationId: string;
  method: OperationDocMethod;
  path: string;
  summary: string;
  description: string;
  tags?: string[];
  requestPathParams?: Record<string, OperationDocRequestParam>;
  requestQuerystringParams?: Record<string, OperationDocRequestParam>;
  requestCookies?: Record<string, OperationDocRequestCookie>;
  requestBody?: OperationDocRequestBody;
  responses: Record<string, OperationDocResponse>;
}
