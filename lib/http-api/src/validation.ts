import { NextResponse, type NextRequest } from "next/server";
import type { TSchema } from "typebox";
import Schema, { type Validator } from "typebox/schema";

import type { VoyzuHttpApiRoute } from "./voyzu.http-api.types";

const validators = new WeakMap<TSchema, Validator>();

function mediaType(value: string | null): string | undefined {
  return value?.split(";", 1)[0]?.trim().toLowerCase() || undefined;
}

function validator(schema: TSchema): Validator {
  const existing = validators.get(schema);
  if (existing) return existing;
  const compiled = Schema.Compile(schema);
  validators.set(schema, compiled);
  return compiled;
}

function validationMessages(schema: TSchema, value: unknown, path: string): string[] {
  return validator(schema).Errors(value)[1].map((error) =>
    `${path}${error.instancePath} ${error.message}`.trim(),
  );
}

function validationError(message: string): NextResponse {
  return NextResponse.json({ code: "INPUT_VALIDATION_ERROR", message }, { status: 400 });
}

function invalidResponse(
  response: NextResponse,
  route: VoyzuHttpApiRoute,
  errors: readonly string[],
): NextResponse {
  const message = `Invalid ${route.id} (${route.method} ${route.path}) response: ${errors.join("; ")}`;
  if (process.env.NODE_ENV !== "production") throw new Error(message);
  console.error(message);
  return response;
}

function queryValue(schema: TSchema | undefined, values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  return schema && "type" in schema && schema.type === "array" ? values : values.at(-1);
}

export async function validateHttpApiRequest(
  request: NextRequest,
  route: VoyzuHttpApiRoute,
  params: Record<string, string>,
): Promise<NextResponse | null> {
  const definition = route.request;
  if (!definition) return null;
  const errors: string[] = [];

  for (const [name, parameter] of Object.entries(definition.path ?? {})) {
    const value = params[name];
    if (value === undefined) {
      errors.push(`path.${name} is required`);
      continue;
    }
    if (!validator(parameter.schema).Check(value)) {
      errors.push(...validationMessages(parameter.schema, value, `path.${name}`));
    }
  }

  if (definition.query) {
    const properties = "properties" in definition.query.schema
      ? definition.query.schema.properties as Record<string, TSchema>
      : {};
    const raw = Object.fromEntries(Object.keys(definition.query.parameters).flatMap((name) => {
      const values = request.nextUrl.searchParams.getAll(name);
      const property = properties[name];
      if (values.length > 1 && (!property || !("type" in property) || property.type !== "array")) errors.push(`query.${name} must occur only once`);
      const value = queryValue(properties[name], values);
      return value === undefined ? [] : [[name, value]];
    }));
    if (!validator(definition.query.schema).Check(raw)) {
      errors.push(...validationMessages(definition.query.schema, raw, "query"));
    }
  }

  for (const name of definition.cookies ?? []) {
    if (!request.cookies.has(name)) errors.push(`cookie.${name} is required`);
  }

  if (definition.body) {
    const expectedContentType = definition.contentType ?? "application/json";
    const actualContentType = mediaType(request.headers.get("content-type"));
    if (actualContentType !== expectedContentType) {
      errors.push(`content-type must be ${expectedContentType}`);
    } else if (expectedContentType === "application/json") {
      try {
        const body = await request.clone().json() as unknown;
        if (!validator(definition.body).Check(body)) {
          errors.push(...validationMessages(definition.body, body, "body"));
        }
      } catch {
        errors.push("body is required and must be valid JSON");
      }
    } else {
      const body = await request.clone().arrayBuffer();
      if (body.byteLength === 0) errors.push("body is required");
    }
  }

  return errors.length > 0 ? validationError(errors.join("; ")) : null;
}

export async function validateHttpApiResponse(
  response: NextResponse,
  route: VoyzuHttpApiRoute,
): Promise<NextResponse> {
  const definition = route.responses[String(response.status)];
  if (!definition) return invalidResponse(response, route, [`status ${response.status} is not declared`]);
  const missingCookies = (definition.cookies ?? []).filter(name => !response.cookies.has(name));
  if (missingCookies.length) return invalidResponse(response, route, missingCookies.map(name => `cookie.${name} is required`));

  const expectedContentType = definition.contentType ?? (definition.body ? "application/json" : undefined);
  if (expectedContentType) {
    const actualContentType = mediaType(response.headers.get("content-type"));
    if (actualContentType !== expectedContentType) {
      return invalidResponse(response, route, [`content-type must be ${expectedContentType}`]);
    }
  }

  if (!definition.body || expectedContentType !== "application/json") return response;

  try {
    const body = await response.clone().json() as unknown;
    return validator(definition.body).Check(body)
      ? response
      : invalidResponse(response, route, validationMessages(definition.body, body, "body"));
  } catch (error) {
    if (error instanceof SyntaxError) return invalidResponse(response, route, ["body must be valid JSON"]);
    throw error;
  }
}
