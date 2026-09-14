import type { HttpApiMethod } from "./http-api-method";
import type { TSchema } from "typebox";

export interface HttpApiParameterDefinition {
  description?: string;
  required?: boolean;
  schema: TSchema;
}

export interface HttpApiQueryDefinition {
  parameters: Record<string, Omit<HttpApiParameterDefinition, "schema">>;
  schema: TSchema;
}

export type HttpApiCookieDefinition = readonly string[];

export interface HttpApiRequestDefinition {
  path?: Record<string, HttpApiParameterDefinition>;
  query?: HttpApiQueryDefinition;
  cookies?: HttpApiCookieDefinition;
  contentType?: string;
  body?: TSchema;
}

export interface HttpApiResponseDefinition {
  description: string;
  contentType?: string;
  body?: TSchema;
  cookies?: HttpApiCookieDefinition;
}

export interface HttpApiRouteDefinition {
  method: HttpApiMethod;
  path: string;
  summary: string;
  description: string;
  request?: HttpApiRequestDefinition;
  responses: Record<string, HttpApiResponseDefinition>;
  loadHandler: () => Promise<(...args: any[]) => any>;
}

export interface HttpApiRouting {
  roots: readonly string[];
  routes: Readonly<Record<string, HttpApiRouteDefinition>>;
}

export interface HttpApiDocumentation {
  sections: Readonly<Record<string, {
    /** Merge groups under a shared navigation heading, using this section title. */
    navigationHeadingId?: string;
    title: string;
    description: string;
    groups: Readonly<Record<string, {
      title: string;
      description: string;
      routes: readonly string[];
    }>>;
  }>>;
}

export interface HttpApiRegistration {
  packageName: string;
  routing: HttpApiRouting;
  documentation: HttpApiDocumentation;
}

export interface HttpApiRegisteredRoute extends HttpApiRouteDefinition {
  id: string;
  packageName: string;
}
