import type { JsonSchema } from "@voyzu/ui-components";

type JsonSchemaObject = JsonSchema & {
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  items?: JsonSchemaObject;
  oneOf?: JsonSchemaObject[];
  anyOf?: JsonSchemaObject[];
  allOf?: JsonSchemaObject[];
};

export function omitAuditFromSchema<TSchema extends JsonSchema | undefined>(schema: TSchema): TSchema {
  if (!schema || typeof schema !== "object") return schema;

  const source = schema as JsonSchemaObject;
  const next: JsonSchemaObject = { ...source };

  if (source.properties) {
    next.properties = Object.fromEntries(
      Object.entries(source.properties)
        .filter(([name]) => name !== "audit")
        .map(([name, property]) => [name, omitAuditFromSchema(property)]),
    );
  }

  if (source.required) {
    next.required = source.required.filter((name) => name !== "audit");
  }

  if (source.items) {
    next.items = omitAuditFromSchema(source.items);
  }

  if (source.oneOf) {
    next.oneOf = source.oneOf.map((item) => omitAuditFromSchema(item));
  }

  if (source.anyOf) {
    next.anyOf = source.anyOf.map((item) => omitAuditFromSchema(item));
  }

  if (source.allOf) {
    next.allOf = source.allOf.map((item) => omitAuditFromSchema(item));
  }

  return next as TSchema;
}

export function omitAuditFromExample<TValue>(value: TValue): TValue {
  if (Array.isArray(value)) {
    return value.map((item) => omitAuditFromExample(item)) as TValue;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([name]) => name !== "audit")
      .map(([name, property]) => [name, omitAuditFromExample(property)]),
  ) as TValue;
}
