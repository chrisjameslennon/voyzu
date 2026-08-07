export type DtoSchemaRef = {
  $ref: `#/components/schemas/${string}`;
};

export type ArraySchema = {
  type: "array";
  items: ApiSchema;
};

export type ObjectSchema = {
  type: "object";
  properties?: Record<string, ApiSchema>;
  required?: string[];
  description?: string;
};

export type StringSchema = {
  type: "string";
  description?: string;
};

export type ApiSchema = DtoSchemaRef | ArraySchema | ObjectSchema | StringSchema | Record<string, unknown>;

export function dtoRef(dtoName: string): DtoSchemaRef {
  return {
    $ref: `#/components/schemas/${dtoName}`,
  };
}

export function arrayOf(items: ApiSchema): ArraySchema {
  return {
    type: "array",
    items,
  };
}
