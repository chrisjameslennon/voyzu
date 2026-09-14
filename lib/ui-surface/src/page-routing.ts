import Schema, { type Validator } from "typebox/schema";
import type { TSchema } from "typebox";
import type {
  PageParameter, PageParameters, PageParameterValue,
  PageRouting, RawPageParameters, RegisteredPageRoute,
} from "@voyzu/types/page-routing";

const validators = new WeakMap<object, Validator>();
type UrlSchema = TSchema & { type?: unknown; items?: UrlSchema; pattern?: unknown };
function schemaOf(parameter: PageParameter): UrlSchema {
  if (parameter.schema) return parameter.schema;
  const { default: _default, description: _description, ...schema } = parameter;
  return schema as TSchema;
}
function validator(parameter: PageParameter): Validator {
  let result = validators.get(parameter);
  if (!result) {
    result = Schema.Compile(schemaOf(parameter));
    validators.set(parameter, result);
  }
  return result;
}

function validateSchema(schema: UrlSchema, arrayAllowed: boolean, location: string): void {
  if (!schema || typeof schema !== "object" || !["string", "number", "integer", "boolean", ...(arrayAllowed ? ["array"] : [])].includes(String(schema.type))) {
    throw new Error(`${location}: use a primitive schema${arrayAllowed ? " or an array of primitives" : ""}.`);
  }
  for (const key of ["anyOf", "oneOf", "allOf", "not", "$ref", "if", "then", "else", "properties", "required"]) {
    if (key in schema) throw new Error(`${location}: unsupported URL schema keyword ${key}.`);
  }
  if (schema.type === "array") validateSchema(schema.items as UrlSchema, false, `${location}.items`);
  const values = schema as Record<string, unknown>;
  const numeric = schema.type === "number" || schema.type === "integer";
  const allowed = new Set([
    "type", "enum", "const", "description", "title", "$id", "$schema", "examples", "default",
    ...(schema.type === "string" ? ["minLength", "maxLength", "pattern"] : []),
    ...(numeric ? ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf"] : []),
    ...(schema.type === "array" ? ["items", "minItems", "maxItems", "uniqueItems"] : []),
  ]);
  for (const key of Object.keys(values)) {
    if (!allowed.has(key)) throw new Error(`${location}: unsupported or incompatible ${key} constraint.`);
  }
  for (const key of ["minLength", "maxLength", "minItems", "maxItems"]) {
    if (key in values && (typeof values[key] !== "number" || !Number.isInteger(values[key]) || (values[key] as number) < 0)) throw new Error(`${location}: ${key} must be a non-negative integer.`);
  }
  for (const key of ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf"]) {
    if (key in values && (typeof values[key] !== "number" || !Number.isFinite(values[key]) || (key === "multipleOf" && (values[key] as number) <= 0))) throw new Error(`${location}: invalid ${key}.`);
  }
  for (const [min, max] of [["minLength", "maxLength"], ["minItems", "maxItems"], ["minimum", "maximum"]]) {
    if (typeof values[min] === "number" && typeof values[max] === "number" && (values[min] as number) > (values[max] as number)) throw new Error(`${location}: ${min} exceeds ${max}.`);
  }
  if ("pattern" in schema) {
    if (typeof schema.pattern !== "string") throw new Error(`${location}: pattern must be a string.`);
    new RegExp(schema.pattern);
  }
  if ("enum" in values && (!Array.isArray(values.enum) || !values.enum.length)) throw new Error(`${location}: enum must be a non-empty array.`);
  if ("uniqueItems" in values && typeof values.uniqueItems !== "boolean") throw new Error(`${location}: uniqueItems must be boolean.`);
}

function validateParameters(routeId: string, parameters: PageParameters | undefined, query: boolean): void {
  if (parameters === undefined) return;
  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) throw new Error(`${routeId}: invalid parameter map.`);
  for (const [name, parameter] of Object.entries(parameters)) {
    const location = `${routeId}.${query ? "queryParams" : "pathParams"}.${name}`;
    if (!parameter || typeof parameter !== "object") throw new Error(`${location}: invalid parameter declaration.`);
    if ("required" in parameter) throw new Error(`${location}: query presence is optional; path presence follows the URL pattern.`);
    if ("schema" in parameter && (!parameter.schema || Object.keys(parameter).some(key => !["schema", "description", "default"].includes(key)))) {
      throw new Error(`${location}: use schema or inline constraints, not both.`);
    }
    const schema = schemaOf(parameter);
    validateSchema(schema, query, location);
    const compiled = validator(parameter);
    if ("default" in parameter && (!query || !compiled.Check(parameter.default))) throw new Error(`${location}: invalid default.`);
  }
}

export function pagePattern(path: string): string {
  return path.replace(/\[[^/\]]+\]/g, "[]");
}

/** Static segments win at the first differing position, independently of declaration order. */
export function comparePageRoutes(left: { path: string }, right: { path: string }): number {
  const a = left.path.split("/");
  const b = right.path.split("/");
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const dynamicA = a[i].startsWith("[");
    const dynamicB = b[i].startsWith("[");
    if (dynamicA !== dynamicB) return dynamicA ? 1 : -1;
    if (a[i] !== b[i] && !dynamicA) return a[i].localeCompare(b[i]);
  }
  return b.length - a.length;
}

export function validatePageRouting(packageName: string, routing: PageRouting | undefined): void {
  if (routing === undefined) return;
  if (!routing || !Array.isArray(routing.roots) || !routing.routes || typeof routing.routes !== "object" || Array.isArray(routing.routes)) {
    throw new Error(`${packageName}: pageRouting requires roots and a routes object.`);
  }
  for (const root of routing.roots) {
    if (typeof root !== "string" || !/^\/(?:[^/?#\[\]\\]+\/)*[^/?#\[\]\\]+$/.test(root) || root.split("/").some(segment => segment === "." || segment === "..")) throw new Error(`${packageName}: invalid page root ${root}.`);
  }
  const patterns = new Set<string>();
  for (const [id, route] of Object.entries(routing.routes)) {
    if (!id.trim() || !route || typeof route !== "object" || "id" in route) throw new Error(`${packageName}: route IDs belong in object keys.`);
    if (typeof route.path !== "string" || !route.path.startsWith("/") || /[?#\\]/.test(route.path) || route.path.endsWith("/")) throw new Error(`${id}: invalid page path.`);
    if (!routing.roots.some(root => route.path === root || route.path.startsWith(`${root}/`))) throw new Error(`${id}: path ${route.path} is outside package roots.`);
    const names: string[] = [];
    for (const segment of route.path.split("/").slice(1)) {
      if (!segment || segment === "." || segment === "..") throw new Error(`${id}: invalid path segment.`);
      if (/[\[\]]/.test(segment)) {
        const match = /^\[([A-Za-z_][A-Za-z0-9_]*)\]$/.exec(segment);
        if (!match || names.includes(match[1])) throw new Error(`${id}: use distinct single-segment path placeholders.`);
        names.push(match[1]);
      }
    }
    if (names.length !== Object.keys(route.pathParams ?? {}).length || names.some(name => !Object.hasOwn(route.pathParams ?? {}, name))) throw new Error(`${id}: pathParams must match path placeholders exactly.`);
    if (typeof route.pageTitle !== "string" || !route.pageTitle.trim() || typeof route.loadPage !== "function") throw new Error(`${id}: pageTitle and lazy loadPage are required.`);
    if (route.helpPath !== undefined && route.helpPathResolver !== undefined) throw new Error(`${id}: use helpPath or helpPathResolver, not both.`);
    if (route.helpPathResolver !== undefined && typeof route.helpPathResolver !== "function") throw new Error(`${id}: invalid helpPathResolver.`);
    if (route.helpPath !== undefined && typeof route.helpPath !== "string") throw new Error(`${id}: invalid helpPath.`);
    if (route.unframed !== undefined && typeof route.unframed !== "boolean") throw new Error(`${id}: invalid unframed flag.`);
    if (route.httpApiDocumentationGroupId !== undefined && (typeof route.httpApiDocumentationGroupId !== "string" || !route.httpApiDocumentationGroupId.trim())) throw new Error(`${id}: invalid HTTP API documentation group ID.`);
    if (route.breadcrumbBase !== undefined && (!Array.isArray(route.breadcrumbBase) || route.breadcrumbBase.some(item => !item || typeof item.label !== "string" || (item.href !== undefined && typeof item.href !== "string")))) throw new Error(`${id}: invalid breadcrumbs.`);
    if (route.auth !== undefined) {
      const auth = route.auth;
      if (!auth || typeof auth !== "object" || (auth.required !== undefined && typeof auth.required !== "boolean") || (auth.minRole !== undefined && !["STANDARD", "ADMIN"].includes(auth.minRole)) || (auth.authorize !== undefined && typeof auth.authorize !== "function")) throw new Error(`${id}: invalid authorization declaration.`);
    }
    validateParameters(id, route.pathParams, false);
    validateParameters(id, route.queryParams, true);
    const pattern = pagePattern(route.path);
    if (patterns.has(pattern)) throw new Error(`${id}: duplicate page path pattern ${pattern}.`);
    patterns.add(pattern);
  }
}

function parseValue(schema: UrlSchema, raw: string | string[]): PageParameterValue {
  if (schema.type === "array") return (Array.isArray(raw) ? raw : [raw]).map(value => parseValue(schema.items as UrlSchema, value)) as (string | number | boolean)[];
  if (Array.isArray(raw)) throw new Error("must occur only once");
  if (schema.type === "string") return raw;
  if (schema.type === "boolean") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    throw new Error('must be "true" or "false"');
  }
  if (schema.type === "number" || schema.type === "integer") {
    if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) throw new Error("must be a signed decimal number");
    const value = Number(raw);
    if (!Number.isFinite(value) || (schema.type === "integer" && !Number.isInteger(value))) throw new Error(`must be a finite ${schema.type}`);
    return value;
  }
  throw new Error("unsupported URL schema");
}

export function parsePageParameters(route: RegisteredPageRoute, kind: "pathParams" | "queryParams", raw: RawPageParameters): Record<string, PageParameterValue | undefined> {
  const declarations = route[kind] ?? {};
  const supplied = Object.fromEntries(Object.keys(declarations).flatMap(name => !Object.hasOwn(raw, name) || raw[name] === undefined ? [] : [[name, raw[name]]]));
  const parsed: [string, PageParameterValue | undefined][] = [];
  const errors: string[] = [];
  for (const [name, parameter] of Object.entries(declarations)) {
    try {
      const value = supplied[name];
      if (value === undefined) {
        if (kind === "pathParams") throw new Error("is required by the route path");
        if ("default" in parameter) parsed.push([name, structuredClone(parameter.default) as PageParameterValue]);
        continue;
      }
      const result = parseValue(schemaOf(parameter), value);
      if (!validator(parameter).Check(result)) throw new Error("does not satisfy its declared schema");
      parsed.push([name, result]);
    } catch (error) {
      errors.push(`${route.id}.${kind}.${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (errors.length) {
    const error = new Error(`Invalid page parameters: ${errors.join("; ")}`);
    if (process.env.NODE_ENV !== "production") throw error;
    console.error(error);
    return supplied;
  }
  return Object.fromEntries(parsed);
}
