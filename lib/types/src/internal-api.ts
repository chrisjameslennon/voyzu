import type { Static, TSchema } from "typebox";

/**
 * Declaration of a package's data contribution to a platform-owned resource.
 * This is metadata for distributed implementation, not a separate calling API.
 * Provider loading and composition of these contributions are not implemented yet.
 */
export interface InternalApiContribution {
  resource: `@core/${string}`;
  dataDefinition: TSchema;
}

export interface InternalApiMethod<I extends TSchema = TSchema, O extends TSchema = TSchema> {
  input: I;
  output: O;
  /** Starts a transaction, or joins the caller's transaction. */
  transactional?: boolean;
  loadHandler: () => Promise<(input: Static<I>) => Promise<Static<O>>>;
}

export interface InternalApiResource {
  /** Fully qualified package resource, e.g. @voyzu/commercial/customer-price-list-items. */
  resource: string;
  // Registry storage erases handler types; defineInternalApiMethod preserves
  // them at declaration sites and runtime validation guards invocation.
  methods: Readonly<Record<string, {
    input: TSchema;
    output: TSchema;
    transactional?: boolean;
    loadHandler: () => Promise<(input: any) => Promise<any>>;
  }>>;
}

/** Preserves schema inference and checks the lazy handler's input and return types. */
export function defineInternalApiMethod<I extends TSchema, O extends TSchema>(
  method: InternalApiMethod<I, O>,
): InternalApiMethod<I, O> {
  return method;
}
