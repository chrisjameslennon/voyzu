import type { TSchema } from "typebox";

export interface InternalApiDefinition {
  dataDefinition: TSchema;
  methods: Readonly<Record<string, {
    input: TSchema;
    output: TSchema;
    transactional?: boolean;
  }>>;
}

/** Used by providers for calls whose results are validated by the dispatcher. */
export interface InternalApiInvoker {
  call(resource: string, method: string, input: unknown): Promise<unknown>;
  callOptional(resource: string, method: string, input: unknown): Promise<unknown | null>;
  has(resource: string, method?: string): boolean;
}

export type InternalApiImplementation = Readonly<Record<string, (input: any) => Promise<any>>>;
export type InternalApiImplementationLoader = (api: InternalApiInvoker) => Promise<InternalApiImplementation>;

/** Composed runtime entry, not a package declaration. */
export interface InternalApiResource {
  /** Whether a provider is registered for this definition. */
  implemented: boolean;
  /** Fully qualified package resource, e.g. @voyzu/commercial/customer-price-list-items. */
  resource: string;
  // Registry storage erases handler types; runtime validation guards invocation.
  methods: Readonly<Record<string, {
    input: TSchema;
    output: TSchema;
    transactional?: boolean;
    loadHandler: (api: InternalApiInvoker) => Promise<(input: any) => Promise<any>>;
  }>>;
}
