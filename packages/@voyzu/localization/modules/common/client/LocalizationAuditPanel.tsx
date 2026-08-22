"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuditPanel, type AuditPanelProps } from "@voyzu/audit/client";
import { detailLinkWithBackContext } from "@voyzu/ui-surface/client";

interface LocalizationAuditPanelProps extends Omit<AuditPanelProps, "onNavigate"> {
  mutationId?: string | null;
}

function withMutationId(auditHref: string | undefined, mutationId: string | null | undefined) {
  if (!auditHref || !mutationId) return auditHref;
  const [path] = auditHref.split("?");
  return `${path}?mutationId=${encodeURIComponent(mutationId)}`;
}

export function LocalizationAuditPanel({
  auditHref,
  mutationId,
  ...props
}: LocalizationAuditPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const targetHref = withMutationId(auditHref, mutationId);
  const resolvedHref = targetHref
    ? detailLinkWithBackContext(targetHref, "organizationAudit", pathname)
    : undefined;
  const navigateToAudit = useCallback((href: string) => router.push(href), [router]);

  return <AuditPanel {...props} auditHref={resolvedHref} onNavigate={navigateToAudit} />;
}
