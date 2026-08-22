"use client";

import { usePathname, useRouter } from "next/navigation";

import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { canAccessRole, useCurrentUserAccess } from "../common/useCurrentUserAccess";

export function SettingsButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useCurrentUserAccess();

  if (!isLoaded || !canAccessRole(user, "ADMIN")) return null;

  return (
    <button
      className={`${styles.iconButton} ${pathname.startsWith("/settings") ? styles.iconButtonActive : ""}`}
      type="button"
      aria-label="Settings"
      onClick={() => router.push("/settings/users")}
    >
      <span className="material-symbols-outlined">settings</span>
    </button>
  );
}
