import type { ApiMethod } from "./api-method";
import type { ApiSchema } from "./schema-ref";

export interface ApiParameterDefinition {
  description?: string;
  required?: boolean;
  schema: ApiSchema;
}

export interface ApiCookieDefinition {
  description?: string;
  required?: boolean;
  example?: unknown;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
  maxAgeSeconds?: number;
}

export interface ApiRequestDefinition {
  path?: Record<string, ApiParameterDefinition>;
  query?: Record<string, ApiParameterDefinition>;
  cookies?: Record<string, ApiCookieDefinition>;
  contentType?: string;
  body?: ApiSchema;
}

export interface ApiResponseDefinition {
  description: string;
  contentType?: string;
  body?: ApiSchema;
  cookies?: Record<string, ApiCookieDefinition & { action?: "set" | "clear" }>;
}

export interface ApiRouteDefinition {
  method: ApiMethod;
  path: string;
  summary: string;
  description: string;
  tags?: readonly string[];
  request?: ApiRequestDefinition;
  responses: Record<string, ApiResponseDefinition>;
  handler: (...args: any[]) => any;
}
