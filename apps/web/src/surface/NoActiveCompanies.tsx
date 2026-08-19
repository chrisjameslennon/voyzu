import Link from "next/link";

import styles from "./no-active-companies.module.css";

interface NoActiveCompaniesProps {
  canManageCompanies: boolean;
}

export function NoActiveCompanies({ canManageCompanies }: NoActiveCompaniesProps) {
  return (
    <section className={styles.page} aria-labelledby="no-active-companies-title">
      <div className={styles.emptyState}>
        <div className={styles.icon} aria-hidden="true">
          <span className="material-symbols-outlined">domain_add</span>
        </div>
        <h1 id="no-active-companies-title" className={styles.title}>No active companies</h1>
        <p className={styles.text}>An active company is required to use the Financial Ledger.</p>
        {canManageCompanies ? (
          <Link className={styles.action} href="/organization/companies">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Manage companies
          </Link>
        ) : null}
      </div>
    </section>
  );
}
