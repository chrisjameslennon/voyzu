"use client";

import { SystemInformationCard } from "@voyzu/ui-components";

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

export function AuditPanel(props: AuditPanelProps) {
  return <SystemInformationCard {...props} />;
}
