"use client";

import { Breadcrumbs } from "@voyzu/ui-components";
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import styles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

export function PackageAccessDenied({ pageTitle }: { pageTitle: string }) {
  return (
    <div className={`${layout.listView} vz-grid-12`}>
      <header className={layout.listHeader}>
        <div className={layout.slotBreadcrumb}><Breadcrumbs /></div>
        <div className={layout.slotTitle}>
          <div className={styles.titleIcon}>
            <span className={`material-symbols-outlined ${styles.titleIconSymbol}`}>deployed_code</span>
          </div>
          <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>{pageTitle}</h1>
        </div>
      </header>
      <div className={layout.slotTable}>
        <div style={{ border: "1px solid var(--voyzu-color-border)", borderRadius: 8, padding: "2rem", background: "var(--voyzu-color-surface)" }}>
          <h2 className={typography.sectionHeading}>You do not have access</h2>
          <p className={typography.bodyText}>Only admin users can manage packages.</p>
        </div>
      </div>
    </div>
  );
}
