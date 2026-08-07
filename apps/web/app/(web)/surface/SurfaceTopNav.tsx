import {
  getSurfaceSlot,
  type VoyzuSurfaceRoute,
  type VoyzuSurfaceSlots,
} from "@voyzu/ui-surface/types";
import { resolveExternalUrl } from "@voyzu/ui-surface";

import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { DeveloperButton } from "./top-nav/DeveloperButton";
import { HelpButton } from "./top-nav/HelpButton";
import { SettingsButton } from "./top-nav/SettingsButton";

interface SurfaceTopNavProps {
  slots: VoyzuSurfaceSlots;
  activeRoute?: VoyzuSurfaceRoute;
}

export function SurfaceTopNav({ slots, activeRoute }: SurfaceTopNavProps) {
  const helpUrl = activeRoute?.helpBaseUrl && activeRoute.helpPath
    ? resolveExternalUrl(activeRoute.helpBaseUrl, activeRoute.helpPath)
    : undefined;

  return (
    <header className={styles.top}>
      <div className={styles.brand}>{getSurfaceSlot(slots, "top.brand")}</div>
      <nav className={`${styles.primaryNav} ${styles.primaryNavWithMobileMenu}`}>
        {getSurfaceSlot(slots, "top.primaryNav")}
      </nav>
      <div className={styles.utility}>
        <DeveloperButton href={activeRoute?.apiDocsUrl} />
        <SettingsButton />
        {helpUrl ? <HelpButton href={helpUrl} /> : null}
        {getSurfaceSlot(slots, "top.user")}
      </div>
    </header>
  );
}
