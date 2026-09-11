import type { TSchema } from "typebox";

export interface CapabilityMethodContract {
  input?: TSchema;
  output?: TSchema;
  /** Starts a transaction, or joins the caller's existing transaction. */
  transactional?: boolean;
}
export interface CapabilityContract {
  definition?: string;
  functions: Readonly<Record<string, CapabilityMethodContract>>;
}
export interface SemanticDataContract {
  definition?: string;
  identifier?: string;
  identifierDataDefinition?: TSchema;
  dataDefinition?: TSchema & { type: "object"; properties: Record<string, TSchema>; required?: readonly string[] };
  extends?: string;
  extensions?: readonly string[];
  queries?: Readonly<Record<string, { inputDataDefinition: TSchema }>>;
}
export interface SemanticDataProvider {
  get: (identifier: any) => Promise<any>;
  queries?: Readonly<Record<string, (input: any) => Promise<any[]>>>;
}
export type CapabilityProvider = Readonly<Record<string, (...args: any[]) => Promise<any>>>;
export interface PackageContracts {
  semanticCapabilityDefinition?: {
    defines?: Readonly<Record<string, CapabilityContract>>;
    implements?: Readonly<Record<string, CapabilityProvider>>;
  };
  semanticDataDefinition?: {
    defines?: Readonly<Record<string, SemanticDataContract>>;
    implements?: Readonly<Record<string, SemanticDataProvider>>;
  };
}
