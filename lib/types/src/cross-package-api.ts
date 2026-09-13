import type { Static, TSchema } from "typebox";

export interface CrossPackageApiMethod<I extends TSchema = TSchema, O extends TSchema = TSchema> {
  input: I;
  output: O;
  /** Starts a transaction, or joins the caller's transaction. */
  transactional?: boolean;
  loadHandler: () => Promise<(input: Static<I>) => Promise<Static<O>>>;
}

export interface CrossPackageApiResource {
  /** Fully qualified package resource, e.g. @voyzu/commercial/customer-price-list-items. */
  resource: string;
  // Registry storage erases handler types; defineCrossPackageApiMethod preserves
  // them at declaration sites and runtime validation guards invocation.
  methods: Readonly<Record<string, {
    input: TSchema;
    output: TSchema;
    transactional?: boolean;
    loadHandler: () => Promise<(input: any) => Promise<any>>;
  }>>;
}

/** Preserves schema inference and checks the lazy handler's input and return types. */
export function defineCrossPackageApiMethod<I extends TSchema, O extends TSchema>(
  method: CrossPackageApiMethod<I, O>,
): CrossPackageApiMethod<I, O> {
  return method;
}
