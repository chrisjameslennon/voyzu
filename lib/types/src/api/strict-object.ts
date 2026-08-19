import Type, {
  type TObjectOptions,
  type TProperties,
} from "typebox";

/** Creates an exact object schema that rejects properties not declared by the DTO. */
export function StrictObject<Properties extends TProperties>(
  properties: Properties,
  options: Omit<TObjectOptions, "additionalProperties"> = {},
) {
  return Type.Object(properties, { ...options, additionalProperties: false });
}
