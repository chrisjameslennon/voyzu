"use client";

import { createContext, lazy, Suspense, useContext, useMemo, type ComponentType, type ReactNode } from "react";
import type { ClientComponentContracts } from "../types/client-components";

type Registration = { id: string; loadComponent: () => Promise<ComponentType<any>> };
const RegistryContext = createContext<ReadonlyMap<string, ComponentType<any>>>(new Map());

/** Registrations are supplied by a generated client module, never serialized by a server component. */
export function ClientComponentProvider({ registrations, children }: { registrations: readonly Registration[]; children: ReactNode }) {
  const registry = useMemo(() => {
    const result = new Map<string, ComponentType<any>>();
    for (const entry of registrations) {
      if (result.has(entry.id)) throw new Error(`Duplicate client component ${entry.id}`);
      result.set(entry.id, lazy(async () => ({ default: await entry.loadComponent() })));
    }
    return result;
  }, [registrations]);
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
}

export function ClientComponentSlot<K extends keyof ClientComponentContracts>({
  name, componentProps, optional = false, fallback = null,
}: { name: K; componentProps: ClientComponentContracts[K]; optional?: boolean; fallback?: ReactNode }) {
  const Component = useContext(RegistryContext).get(name);
  if (!Component) {
    if (optional) return null;
    throw new Error(`No implementation for client component ${name}; run voyzu:compose`);
  }
  return <Suspense fallback={fallback}><Component {...(componentProps as object)} /></Suspense>;
}

function use<K extends keyof ClientComponentContracts>(name: K): ComponentType<ClientComponentContracts[K]> {
  // Call at module scope to keep the adapter identity stable across renders. This is not a hook.
  return function ComposedComponent(props: ClientComponentContracts[K]) {
    return <ClientComponentSlot name={name} componentProps={props} />;
  };
}
export const clientComponent = { use } as const;
