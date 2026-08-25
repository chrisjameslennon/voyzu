"use client";

import { useEffect, useState } from "react";
import type { UserResponseDto } from "@voyzu/auth/types";
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
  const [canViewAudit, setCanViewAudit] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });
        if (cancelled || !response.ok) return;
        const user = await response.json() as UserResponseDto;
        setCanViewAudit(user.role === "ADMIN");
      } catch {
        // Fail closed when the current user's access cannot be determined.
      }
    }

    void loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SystemInformationCard
      {...props}
      auditHref={canViewAudit ? props.auditHref : undefined}
      onNavigate={canViewAudit ? props.onNavigate : undefined}
    />
  );
}
