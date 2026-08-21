"use client";

import { ScopedAuditPanel, type ScopedAuditPanelProps } from "./ScopedAuditPanel";

export function OrganizationAuditPanel(props: ScopedAuditPanelProps) {
  return <ScopedAuditPanel {...props} backSource="organizationAudit" />;
}
