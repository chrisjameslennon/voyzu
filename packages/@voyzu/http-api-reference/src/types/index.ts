import type { JsonSchema } from "@voyzu/ui-components";

export type HttpApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestExampleData {
  method: HttpApiMethod;
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

export interface HttpApiPropertiesPanelData {
  heading: string;
  schema?: JsonSchema;
  message?: string;
}

export interface HttpApiResponsePanelData extends HttpApiPropertiesPanelData {
  status: "200" | "201" | "400" | "409" | "500";
}

export interface HttpApiOperationData {
  id: string;
  title: string;
  method: HttpApiMethod;
  path: string;
  description: string;
  request: {
    panel: HttpApiPropertiesPanelData;
    example: RequestExampleData;
  };
  responses: {
    panels: HttpApiResponsePanelData[];
    example: ResponseExampleData;
  };
}

export interface HttpApiPageData {
  eyebrow: string;
  title: string;
  resourcePath: string;
  description: string;
  operations: HttpApiOperationData[];
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


export interface OperationDocResponse {
  description: string;
  contentType?: string;
  schemaRef?: SchemaRefDoc;
  schema?: JsonSchema;
  example?: unknown;
  cookies?: readonly string[];
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
  requestCookies?: readonly string[];
  requestBody?: OperationDocRequestBody;
  responses: Record<string, OperationDocResponse>;
}
