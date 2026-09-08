"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CurrentIdentity } from "@voyzu/types/identity";

const AccessContext = createContext<CurrentIdentity | null>(null);

/** A request-scoped server snapshot. No Auth imports or browser endpoint dependency. */
export function AccessProvider({ identity, children }: { identity: CurrentIdentity | null; children: ReactNode }) {
  return <AccessContext.Provider value={identity}>{children}</AccessContext.Provider>;
}

export function useCurrentAccess() {
  const identity = useContext(AccessContext);
  return {
    user: identity?.user ?? null,
    can: (permission: string) => identity?.permissions.includes(permission) ?? false,
  };
}
