import Link from "next/link";

import styles from "./no-active-organizations.module.css";

interface NoActiveOrganizationsProps {
  canManageOrganizations: boolean;
}

export function NoActiveOrganizations({ canManageOrganizations }: NoActiveOrganizationsProps) {
  return (
    <section className={styles.page} aria-labelledby="no-active-organizations-title">
      <div className={styles.emptyState}>
        <div className={styles.icon} aria-hidden="true">
          <span className="material-symbols-outlined">domain_add</span>
        </div>
        <h1 id="no-active-organizations-title" className={styles.title}>No active organizations</h1>
        <p className={styles.text}>An active organization is required to use the Financial Ledger.</p>
        {canManageOrganizations ? (
          <Link className={styles.action} href="/organization/organizations">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Manage organizations
          </Link>
        ) : null}
      </div>
    </section>
  );
}
