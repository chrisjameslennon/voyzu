import type { ReactNode } from "react";
import type { Static, TSchema } from "typebox";

export type PageParameterSchema = {
  type: "string" | "number" | "integer" | "boolean" | "array";
  items?: PageParameterSchema | TSchema;
  enum?: readonly unknown[];
  const?: unknown;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
};
export type PageParameter = (
  | (PageParameterSchema & { schema?: never })
  | { schema: TSchema; type?: never }
) & { description?: string; default?: unknown };
export type PageParameters = Readonly<Record<string, PageParameter>>;
export type RawPageParameters = Record<string, string | string[] | undefined>;
export type PageParameterValue = string | number | boolean | (string | number | boolean)[];
type SchemaValue<S> = S extends { enum: readonly (infer E)[] } ? E
  : S extends { const: infer C } ? C
  : S extends { type: "string" } ? string
  : S extends { type: "number" | "integer" } ? number
  : S extends { type: "boolean" } ? boolean
  : S extends { type: "array"; items: infer I } ? SchemaValue<I>[] : unknown;
type ParameterValue<P> = P extends { schema: infer S extends TSchema } ? Static<S> : SchemaValue<P>;
export type ParsedPageParameters<P extends PageParameters> = string extends keyof P
  ? Record<string, PageParameterValue | undefined>
  : { [K in keyof P]: ParameterValue<P[K]> };
export type ParsedPageQuery<P extends PageParameters> = string extends keyof P
  ? Record<string, PageParameterValue | undefined>
  : {
  [K in keyof P as P[K] extends { default: unknown } ? K : never]: ParameterValue<P[K]>
} & { [K in keyof P as P[K] extends { default: unknown } ? never : K]?: ParameterValue<P[K]> };

export interface PageHelpContext {
  path: string;
  pathParams: Record<string, PageParameterValue | undefined>;
  queryParams: Record<string, PageParameterValue | undefined>;
}
export interface PageUserAccess { role?: string; accessMode?: string; status?: string }
export type PageAccessResult = "allow" | "denied" | "unauthenticated";
export interface PageAccessContext { user: PageUserAccess | null; route: RegisteredPageRoute; path: string }
export interface PageRouteDefinition {
  path: string;
  pageTitle: string;
  pathParams?: PageParameters;
  queryParams?: PageParameters;
  loadPage: () => Promise<PageComponent>;
  breadcrumbBase?: readonly { label: string; href?: string }[];
  helpPath?: string;
  helpPathResolver?: (context: PageHelpContext) => string | undefined;
  httpApiDocumentationGroupId?: string;
  unframed?: boolean;
  auth?: {
    required?: boolean;
    minRole?: "STANDARD" | "ADMIN";
    authorize?: (context: PageAccessContext) => PageAccessResult | Promise<PageAccessResult>;
  };
}
export interface RegisteredPageRoute extends PageRouteDefinition {
  id: string;
  rootPath: string;
  packageName?: string;
  helpBaseUrl?: string;
  httpApiDocsUrl?: string;
}
export interface PageRouting {
  roots: Readonly<Record<string, {
    routes: Readonly<Record<string, PageRouteDefinition>>;
  }>>;
}
export interface PageContext<P extends PageParameters = PageParameters, Q extends PageParameters = PageParameters> {
  path: string;
  pathParams: ParsedPageParameters<P> | RawPageParameters;
  queryParams: ParsedPageQuery<Q> | RawPageParameters;
  routeDefinition: RegisteredPageRoute;
}
export interface PageProps<P extends PageParameters = PageParameters, Q extends PageParameters = PageParameters> {
  context: PageContext<P, Q>;
}

/** Like React component types, accepts pages with a more specific declared context. */
export type PageComponent = {
  render(props: PageProps): ReactNode | Promise<ReactNode>;
}["render"];

type UnionToIntersection<U> = (U extends unknown ? (value: U) => void : never) extends (value: infer I) => void ? I : never;

/** Merge module declarations without silently overwriting route identities. */
export function mergePageRoutes<const R extends readonly Readonly<Record<string, PageRouteDefinition>>[]>(...maps: R): UnionToIntersection<R[number]> {
  const routes: Record<string, PageRouteDefinition> = Object.create(null);
  for (const map of maps) for (const [id, route] of Object.entries(map)) {
    if (Object.hasOwn(routes, id)) throw new Error(`Duplicate page route ID: ${id}`);
    routes[id] = route;
  }
  return routes as UnionToIntersection<R[number]>;
}

/** Pages consuming textual filters explicitly ignore repeated/non-text values. */
export function pageStringParameters(values: Record<string, unknown>): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => typeof value === "string")) as Record<string, string>;
}
