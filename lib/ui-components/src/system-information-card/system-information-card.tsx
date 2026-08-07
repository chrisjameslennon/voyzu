"use client";

import { Button } from "../button/button";
import { Badge } from "../badge/badge";

import styles from "@voyzu/ui-style/css-modules/detail.module.css";

interface SystemInformationActor {
  code: string;
  displayName: string;
}

interface SystemInformationCardProps {
  id: string | number;
  creationDate: string;
  updatedDate: string;
  creationActorType?: string | null;
  creationUser?: SystemInformationActor | null;
  updatedActorType?: string | null;
  updatedUser?: SystemInformationActor | null;
  auditHref?: string;
  onNavigate?: (href: string) => void;
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function auditHrefWithAllDates(auditHref: string): string {
  if (auditHref.includes("mutationId=")) return auditHref;
  if (auditHref.includes("dateMode=")) return auditHref;
  return `${auditHref}${auditHref.includes("?") ? "&" : "?"}dateMode=all`;
}

export function SystemInformationCard({
  id,
  creationDate,
  updatedDate,
  creationActorType,
  creationUser,
  updatedActorType,
  updatedUser,
  auditHref,
  onNavigate,
}: SystemInformationCardProps) {
  return (
    <div className={styles.systemCard}>
      <h3 className={styles.systemTitle}>
        <span className="material-symbols-outlined">info</span>
        System Information
      </h3>
      <div className={styles.systemBody}>
        <div className={styles.systemRow}>ID: <strong>{id}</strong></div>
        <div className={styles.systemRow}>Created <strong>{formatDate(creationDate)}</strong></div>
        <AuditViaRow label="Created via" actorType={creationActorType} />
        <AuditUserRow label="Created by" actor={creationUser} />
        <div className={styles.systemRow}>Updated <strong>{formatDate(updatedDate)}</strong></div>
        <AuditViaRow label="Updated via" actorType={updatedActorType} />
        <AuditUserRow label="Updated by" actor={updatedUser} />
        {auditHref && onNavigate && (
          <div className={styles.systemFooter}>
            <Button
              variant="secondary"
              className={styles.fullWidthAction}
              onClick={() => onNavigate(auditHrefWithAllDates(auditHref))}
            >
              View audit information
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditViaRow({
  label,
  actorType,
}: {
  label: string;
  actorType?: string | null;
}) {
  return (
    <div className={`${styles.systemRow} ${styles.systemActorRow}`}>
      <span>{label}:</span>
      <strong>{actorType || ""}</strong>
    </div>
  );
}

function AuditUserRow({
  label,
  actor,
}: {
  label: string;
  actor?: SystemInformationActor | null;
}) {
  return (
    <div className={`${styles.systemRow} ${styles.systemActorRow}`}>
      <span>{label}:</span>
      {actor ? (
        <>
          <strong>{actor.displayName}</strong>
          <Badge variant="soft" size="small" color="neutral">
            {actor.code}
          </Badge>
        </>
      ) : null}
    </div>
  );
}
