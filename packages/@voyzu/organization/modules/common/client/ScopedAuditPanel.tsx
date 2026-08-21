"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuditPanel, type AuditPanelProps } from "@voyzu/audit/client";
import { detailLinkWithBackContext, type DetailBackSource } from "@voyzu/ui-surface/client";

export interface ScopedAuditPanelProps extends Omit<AuditPanelProps, "onNavigate"> {
  mutationId?: string | null;
}

interface ScopedAuditPanelInternalProps extends ScopedAuditPanelProps {
  backSource: Extract<DetailBackSource, "companyAudit" | "organizationAudit">;
}

function withMutationId(auditHref: string | undefined, mutationId: string | null | undefined) {
  if (!auditHref || !mutationId) return auditHref;
  const [path] = auditHref.split("?");
  return `${path}?mutationId=${encodeURIComponent(mutationId)}`;
}

export function ScopedAuditPanel({
  auditHref,
  mutationId,
  backSource,
  ...props
}: ScopedAuditPanelInternalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const resolveHref = useCallback((href: string, resolvedMutationId?: string | null) => {
    const target = withMutationId(href, resolvedMutationId);
    return target ? detailLinkWithBackContext(target, backSource, pathname) : undefined;
  }, [backSource, pathname]);

  const targetHref = auditHref ? resolveHref(auditHref, mutationId) : undefined;

  const navigateToAudit = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return <AuditPanel {...props} auditHref={targetHref} onNavigate={navigateToAudit} />;
}
