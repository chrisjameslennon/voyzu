"use client";

import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { useCurrentUserAccess } from "../common/useCurrentUserAccess";

interface DeveloperButtonProps {
  href?: string;
}

export function DeveloperButton({ href }: DeveloperButtonProps) {
  const { user, isLoaded } = useCurrentUserAccess();

  if (!isLoaded || !user?.showDeveloperLinks || !href) return null;

  return (
    <a
      className={styles.iconButton}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="API documentation"
      title="API documentation"
    >
      <span className="material-symbols-outlined">code</span>
    </a>
  );
}
