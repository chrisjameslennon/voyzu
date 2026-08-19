import { NextResponse, type NextRequest } from "next/server";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";

import type {
  VoyzuApiModuleRoute,
  VoyzuApiValidationSchema,
} from "./voyzu.api.types";

type JsonSchema = Record<string, unknown>;

const jsonAjv = new Ajv({ allErrors: true, jsonPointers: true });
const parameterAjv = new Ajv({ allErrors: true, coerceTypes: true, jsonPointers: true });
const jsonValidators = new WeakMap<JsonSchema, ValidateFunction>();
const parameterValidators = new WeakMap<JsonSchema, ValidateFunction>();

function mediaType(value: string | null): string | undefined {
  return value?.split(";", 1)[0]?.trim().toLowerCase() || undefined;
}

function errorMessages(errors: ErrorObject[] | null | undefined, path: string): string[] {
  return (errors ?? []).map((error) =>
    `${path}${error.dataPath || ""} ${error.message ?? "is invalid"}`
  );
}

function validateSchema(value: unknown, schema: JsonSchema, path: string): string[] {
  let validate = jsonValidators.get(schema);
  if (!validate) {
    validate = jsonAjv.compile(schema);
    jsonValidators.set(schema, validate);
  }
  return validate(value) ? [] : errorMessages(validate.errors, path);
}

function validateParameter(value: string, schema: JsonSchema, path: string): string[] {
  let validate = parameterValidators.get(schema);
  if (!validate) {
    validate = parameterAjv.compile(schema);
    parameterValidators.set(schema, validate);
  }
  return validate(value) ? [] : errorMessages(validate.errors, path);
}

function validationError(message: string): NextResponse {
  return NextResponse.json({ code: "INPUT_VALIDATION_ERROR", message }, { status: 400 });
}

function responseValidationError(route: VoyzuApiModuleRoute, errors: readonly string[]): NextResponse {
  const message = `Invalid ${route.method} ${route.path} response: ${errors.join("; ")}`;
  console.error(message);
  return NextResponse.json(
    { code: "INTERNAL_SERVER_ERROR", message: "The API returned an invalid response" },
    { status: 500 },
  );
}

export async function validateApiRequest(
  request: NextRequest,
  route: VoyzuApiModuleRoute,
  params: Record<string, string>,
  validation: VoyzuApiValidationSchema,
): Promise<NextResponse | null> {
  const definition = validation.request;
  if (!definition) return null;
  const errors: string[] = [];

  for (const [name, parameter] of Object.entries(definition.path ?? {})) {
    const value = params[name];
    if (value === undefined) errors.push(`path.${name} is required`);
    else errors.push(...validateParameter(value, parameter.schema as JsonSchema, `path.${name}`));
  }
  for (const [name, parameter] of Object.entries(definition.query ?? {})) {
    const values = request.nextUrl.searchParams.getAll(name);
    if (parameter.required && values.length === 0) errors.push(`query.${name} is required`);
    for (const value of values) {
      errors.push(...validateParameter(value, parameter.schema as JsonSchema, `query.${name}`));
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
        errors.push(...validateSchema(body, definition.body, "body"));
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
  validation: VoyzuApiValidationSchema,
): Promise<NextResponse> {
  const definition = validation.responses[String(response.status)];
  if (!definition) {
    return responseValidationError(route, [`status ${response.status} is not declared`]);
  }
  const expectedContentType = definition.contentType ?? (definition.body ? "application/json" : undefined);
  if (expectedContentType) {
    const actualContentType = mediaType(response.headers.get("content-type"));
    if (actualContentType !== expectedContentType) {
      return responseValidationError(route, [`content-type must be ${expectedContentType}`]);
    }
  }
  if (!definition.body) return response;
  if (expectedContentType !== "application/json") return response;

  try {
    const body = await response.clone().json() as unknown;
    const errors = validateSchema(body, definition.body, "body");
    return errors.length > 0 ? responseValidationError(route, errors) : response;
  } catch {
    return responseValidationError(route, ["body must be valid JSON"]);
  }
}
