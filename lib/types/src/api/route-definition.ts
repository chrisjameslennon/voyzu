import type { ApiMethod } from "./api-method";
import type { TSchema } from "typebox";

export interface ApiParameterDefinition {
  description?: string;
  required?: boolean;
  schema: TSchema;
}

export interface ApiQueryDefinition {
  parameters: Record<string, Omit<ApiParameterDefinition, "schema">>;
  schema: TSchema;
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
  query?: ApiQueryDefinition;
  cookies?: Record<string, ApiCookieDefinition>;
  contentType?: string;
  body?: TSchema;
}

export interface ApiResponseDefinition {
  description: string;
  contentType?: string;
  body?: TSchema;
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
  loadHandler: () => Promise<(...args: any[]) => any>;
}
