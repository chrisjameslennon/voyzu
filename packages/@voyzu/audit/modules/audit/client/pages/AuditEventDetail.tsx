"use client";

import { DetailBackButton } from "@voyzu/ui-surface/client";
import type { AuditEventResponseDto } from "@voyzu/audit/types";

import { getAuditActionColor } from "@voyzu/audit/client";
import { Badge, Breadcrumbs } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import styles from "./audit-event-detail.module.css";

interface AuditEventDetailProps {
  event: AuditEventResponseDto;
  routeBasePath?: string;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

export function AuditEventDetail({
  event,
  routeBasePath = "/settings/audit",
}: AuditEventDetailProps) {
  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString(); }
    catch { return d; }
  };

  return (
    <div className={styles.page}>
      <header className={layoutStyles.pageHeaderGrid}>
        <Breadcrumbs />

        {/* Title row */}
        <div className={layoutStyles.pageTitle}>
          <div className={layoutStyles.title}>
            <div className={layoutStyles.titleIconAligner}>
              <div className={layoutStyles.titleIcon}>
                <span className={layoutStyles.titleIconSymbol}>manage_search</span>
              </div>
            </div>
            <div>
              <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>{event.code}</h1>
              <p className={styles.headerSub}>{event.entityType} - {event.entityCode ?? event.entityId}</p>
            </div>
          </div>
          <div className={layoutStyles.headerActions}>
            <DetailBackButton fallbackHref={routeBasePath} preserveSearchParams />
          </div>
        </div>
      </header>

      {/* Content grid */}
      <div className={styles.contentGrid}>
        {/* Changes table */}
        <div className={styles.changesCard}>
          <h2 className={styles.changesTitle}>Field Changes</h2>
          {(!event.changes || event.changes.length === 0) ? (
            <p className={styles.noChanges}>No field-level changes recorded for this event.</p>
          ) : (
            <table className={styles.changesTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Field</th>
                  <th className={styles.th}>Before</th>
                  <th className={styles.th}>After</th>
                </tr>
              </thead>
              <tbody>
                {event.changes.map((c) => (
                  <tr key={c.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdField}`}>{c.fieldPath}</td>
                    <td className={`${styles.td} ${styles.tdOld}`}>{formatValue(c.oldValue)}</td>
                    <td className={`${styles.td} ${styles.tdNew}`}>{formatValue(c.newValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>
              <span className="material-symbols-outlined">info</span>
              Event Details
            </h3>
            <div className={styles.infoBody}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Action</span>
                <Badge
                  variant="soft"
                  size="small"
                  color={getAuditActionColor(event.action)}
                >
                  {event.action}
                </Badge>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Package</span>
                <span className={styles.infoValue}>{event.packageCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Entity Type</span>
                <span className={styles.infoValue}>{event.entityType}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Entity Code</span>
                <span className={styles.infoValue}>{event.entityCode ?? "-"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Entity ID</span>
                <span className={styles.infoValue}>{event.entityId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Actor Type</span>
                <span className={styles.infoValue}>{event.actorType}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>User ID</span>
                <span className={styles.infoValue}>{event.actorId ?? "-"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>User Name</span>
                <span className={styles.infoValue}>{event.actorDisplayName ?? "-"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>User Code</span>
                <span className={styles.infoValue}>{event.actorCode ?? "-"}</span>
              </div>
              {event.companyId != null && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Company ID</span>
                  <span className={styles.infoValue}>{event.companyId}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Timestamp</span>
                <span className={styles.infoValue}>{formatDate(event.creationDate)}</span>
              </div>
              <div className={`${styles.infoRow} ${styles.infoRowStacked}`}>
                <span className={styles.infoLabel}>Mutation ID</span>
                <span className={styles.infoValue}>{event.mutationId ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

