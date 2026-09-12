import type { ComponentType } from "react";

/** Extend by declaration merging for registered client component identities. */
export interface ClientComponentContracts {}

export type VoyzuClientComponentDefinition<K extends keyof ClientComponentContracts = keyof ClientComponentContracts> = K extends keyof ClientComponentContracts ? {
  id: K;
  loadComponent: () => Promise<ComponentType<ClientComponentContracts[K]>>;
} : never;
