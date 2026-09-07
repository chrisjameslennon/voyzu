import type { TSchema } from "typebox";

export interface CapabilityMethodContract {
  input: TSchema;
  output: TSchema;
  /** Starts a transaction, or joins the caller's existing transaction. */
  transactional?: boolean;
}
export type CapabilityContract = Readonly<Record<string, CapabilityMethodContract>>;
export interface MasterDataContract {
  id: TSchema;
  data: TSchema;
  key?: string;
  extends?: { root: string; key: string };
}
export interface PackageContracts {
  defines?: {
    capabilities?: Readonly<Record<string, CapabilityContract>>;
    masterData?: Readonly<Record<string, MasterDataContract>>;
  };
  implements?: {
    capabilities?: Readonly<Record<string, {
      load: () => Promise<Readonly<Record<string, (input: any) => Promise<any>>>>;
    }>>;
    masterData?: Readonly<Record<string, {
      get: (id: any) => Promise<any>;
    }>>;
  };
}
