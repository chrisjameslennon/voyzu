"use client";

import { usePathname, useRouter } from "next/navigation";

import { useIsMobile } from "@voyzu/ui-layout";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { canAccessRole, useCurrentUserAccess } from "../common/useCurrentUserAccess";

export function TopNavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user, isLoaded } = useCurrentUserAccess();
  const isFinanceActive = pathname.startsWith("/finance");
  const isSettingsActive = pathname.startsWith("/settings");
  const isOrganizationActive = !isSettingsActive && !isFinanceActive;
  const canAccessOrganization = isLoaded && canAccessRole(user, "STANDARD");
  const canAccessFinance = isLoaded && canAccessRole(user, "STANDARD");

  if (isMobile) {
    const activeLabel = isSettingsActive
      ? "Settings"
      : isFinanceActive
        ? "Financial Ledger"
        : canAccessOrganization
          ? "Organization"
          : "Financial Ledger";

    return (
      <button
        className={`${styles.topNavButton} ${styles.topNavButtonActive}`}
        type="button"
        aria-label={activeLabel}
      >
        {activeLabel}
      </button>
    );
  }

  return (
    <>
      {canAccessOrganization && (
        <button
          className={[
            styles.topNavButton,
            isOrganizationActive ? styles.topNavButtonActive : styles.topNavButtonInactive,
          ].join(" ")}
          type="button"
          aria-label="Go to Organization"
          onClick={() => router.push("/organization/organizations")}
        >
          Organization
        </button>
      )}
      {canAccessFinance && (
        <button
          className={[
            styles.topNavButton,
            isFinanceActive ? styles.topNavButtonActive : styles.topNavButtonInactive,
          ].join(" ")}
          type="button"
          aria-label="Go to Finance"
          onClick={() => router.push("/finance/journals")}
        >
          Financial Ledger
        </button>
      )}
    </>
  );
}
