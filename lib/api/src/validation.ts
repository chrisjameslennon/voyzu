import { NextResponse, type NextRequest } from "next/server";
import type { TSchema } from "typebox";
import Schema, { type Validator } from "typebox/schema";
import Value from "typebox/value";

import type { VoyzuApiModuleRoute } from "./voyzu.api.types";

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
  route: VoyzuApiModuleRoute,
  errors: readonly string[],
): NextResponse {
  const message = `Invalid ${route.method} ${route.path} response: ${errors.join("; ")}`;
  if (process.env.NODE_ENV !== "production") throw new Error(message);
  console.error(message);
  return response;
}

function queryValue(schema: TSchema | undefined, values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  return schema && "type" in schema && schema.type === "array" ? values : values.at(-1);
}

export async function validateApiRequest(
  request: NextRequest,
  route: VoyzuApiModuleRoute,
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
    const converted = Value.Convert(parameter.schema, value);
    if (!validator(parameter.schema).Check(converted)) {
      errors.push(...validationMessages(parameter.schema, converted, `path.${name}`));
    }
  }

  if (definition.query) {
    const properties = "properties" in definition.query.schema
      ? definition.query.schema.properties as Record<string, TSchema>
      : {};
    const raw = Object.fromEntries(Object.keys(definition.query.parameters).flatMap((name) => {
      const value = queryValue(properties[name], request.nextUrl.searchParams.getAll(name));
      return value === undefined ? [] : [[name, value]];
    }));
    const converted = Value.Convert(definition.query.schema, raw);
    if (!validator(definition.query.schema).Check(converted)) {
      errors.push(...validationMessages(definition.query.schema, converted, "query"));
    }
  }

  for (const [name, cookie] of Object.entries(definition.cookies ?? {})) {
    if (cookie.required && !request.cookies.has(name)) errors.push(`cookie.${name} is required`);
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

export async function validateApiResponse(
  response: NextResponse,
  route: VoyzuApiModuleRoute,
): Promise<NextResponse> {
  const definition = route.responses[String(response.status)];
  if (!definition) return invalidResponse(response, route, [`status ${response.status} is not declared`]);

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
