import type { ComponentType } from "react";

export interface AuditPanelProps {
  id: string | number;
  creationDate: string;
  updatedDate: string;
  creationActorType?: string | null;
  creationUser?: { code: string; displayName: string } | null;
  updatedActorType?: string | null;
  updatedUser?: { code: string; displayName: string } | null;
  auditHref?: string;
  onNavigate?: (href: string) => void;
}

/** Platform-owned UI contracts. Extend by declaration merging for additional identities. */
export interface ClientComponentContracts {
  "audit.panel": AuditPanelProps;
  "erp.organization-switcher": OrganizationSwitcherProps;
}
export interface OrganizationSwitcherProps {
  isCollapsed: boolean;
  /** Optional consumer-owned selection endpoint; ERP supplies the default. */
  selectionUrl?: string;
  onSelected?: (organizationId: number) => void;
}
export type VoyzuClientComponentDefinition<K extends keyof ClientComponentContracts = keyof ClientComponentContracts> = K extends keyof ClientComponentContracts ? {
  id: K;
  loadComponent: () => Promise<ComponentType<ClientComponentContracts[K]>>;
} : never;
