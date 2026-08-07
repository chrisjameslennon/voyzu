import styles from "@voyzu/ui-surface/css-modules/surface.module.css";

interface AllCompaniesContextProps {
  isCollapsed: boolean;
}

export function AllCompaniesContext({ isCollapsed }: AllCompaniesContextProps) {
  const displayName = "All Companies";

  return (
    <div
      className={`${styles.companyContext} ${isCollapsed ? styles.companyContextCollapsed : ""}`}
    >
      {!isCollapsed && <div className={styles.companyLabel}>Company</div>}
      <button
        className={`${styles.companyButton} ${isCollapsed ? styles.companyButtonCollapsed : ""}`}
        type="button"
        title={isCollapsed ? displayName : undefined}
      >
        <span className={styles.companyDot} />
        {!isCollapsed && <span>{displayName}</span>}
      </button>
    </div>
  );
}
