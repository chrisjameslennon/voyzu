"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./properties-panel.module.css";

export type PropertiesPanelMode = "open" | "card";
export type JsonSchemaType = "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";

export interface JsonSchema {
  type?: JsonSchemaType | JsonSchemaType[];
  description?: ReactNode;
  enum?: Array<string | number | boolean | null>;
  nullable?: boolean;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
}

export interface PropertiesPanelProps {
  mode?: PropertiesPanelMode;
  heading?: ReactNode;
  schema?: JsonSchema;
  message?: ReactNode;
}

function normalizeType(type: JsonSchema["type"]): string {
  if (Array.isArray(type)) return type.filter((value) => value !== "null").join(" | ");
  return type ?? "object";
}

function formatType(schema: JsonSchema): string {
  const type = normalizeType(schema.type);
  const enumSuffix = schema.enum?.length ? " · enum" : "";
  const nullableSuffix = schema.nullable || (Array.isArray(schema.type) && schema.type.includes("null")) ? " · nullable" : "";
  return `${type}${enumSuffix}${nullableSuffix}`;
}

function formatEnumValue(value: string | number | boolean | null): string {
  if (value === null) return "null";
  return String(value);
}

function unwrapArrayItems(schema: JsonSchema | undefined): JsonSchema | undefined {
  let current = schema;

  while (current?.type === "array" && current.items) {
    current = current.items;
  }

  return current;
}

function getObjectProperties(schema: JsonSchema): Array<[string, JsonSchema]> {
  const objectSchema = unwrapArrayItems(schema);
  if (objectSchema?.properties) return Object.entries(objectSchema.properties);
  return [];
}

function getNestedSchema(schema: JsonSchema): JsonSchema | undefined {
  if (schema.type === "array") return schema.items;
  if (schema.type === "object") return schema;
  return undefined;
}

function renderProperties(schema: JsonSchema | undefined, required: string[] = [], depth = 0): ReactNode {
  if (!schema) return null;

  return getObjectProperties(schema).map(([name, property]) => {
    const nestedSchema = getNestedSchema(property);
    const nestedRequired = unwrapArrayItems(nestedSchema)?.required ?? [];

    return (
      <div
        key={`${depth}-${name}`}
        className={styles.property}
        style={{ "--property-depth": depth } as CSSProperties}
      >
        <div className={styles.propertyHeader}>
          <span className={styles.propertyName}>{name}</span>
          <span className={styles.propertyType}>{formatType(property)}</span>
          {required.includes(name) && <span className={styles.required}>required</span>}
        </div>
        {property.description && <div className={styles.description}>{property.description}</div>}
        {property.enum?.length ? (
          <div className={styles.enumValues}>{property.enum.map(formatEnumValue).join(" | ")}</div>
        ) : null}
        {nestedSchema && (
          <div className={styles.nestedProperties}>
            {renderProperties(nestedSchema, nestedRequired, depth + 1)}
          </div>
        )}
      </div>
    );
  });
}

export function PropertiesPanel({
  mode = "open",
  heading,
  schema,
  message,
}: PropertiesPanelProps) {
  const isRootArray = schema?.type === "array";

  return (
    <section className={`${styles.panel} ${mode === "card" ? styles.card : styles.open}`}>
      {heading && (
        <div className={styles.heading}>
          {heading}
          {isRootArray && <span className={styles.headingType}>array</span>}
        </div>
      )}
      {message ? (
        <div className={styles.message}>{message}</div>
      ) : (
        <div className={styles.properties}>
          {renderProperties(schema, schema?.required ?? schema?.items?.required ?? [])}
        </div>
      )}
    </section>
  );
}
