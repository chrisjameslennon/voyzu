import {
  getSurfaceSlot,
  type RegisteredPageRoute,
  type VoyzuSurfaceSlots,
} from "@voyzu/ui-surface/types";
import { resolveExternalUrl } from "@voyzu/ui-surface";
import { areInstalledPackagePageRoutesVisible } from "@voyzu/package-management/server";

import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { ImplementerMenu } from "./top-nav/ImplementerMenu";
import { HelpButton } from "./top-nav/HelpButton";
import { SettingsButton } from "./top-nav/SettingsButton";

interface SurfaceTopNavProps {
  slots: VoyzuSurfaceSlots;
  activeRoute?: RegisteredPageRoute;
}

export async function SurfaceTopNav({ slots, activeRoute }: SurfaceTopNavProps) {
  const helpUrl = activeRoute?.helpBaseUrl && activeRoute.helpPath
    ? resolveExternalUrl(activeRoute.helpBaseUrl, activeRoute.helpPath)
    : undefined;
  const [httpApiReferenceVisible, uiReferenceVisible] = await Promise.all([
    areInstalledPackagePageRoutesVisible("@voyzu/http-api-reference"),
    areInstalledPackagePageRoutesVisible("@voyzu/ui-reference"),
  ]);
  const httpApiDocsUrl = httpApiReferenceVisible
    ? activeRoute?.httpApiDocsUrl ?? "/http-api-reference"
    : undefined;

  return (
    <header className={styles.top}>
      <div className={styles.brand}>{getSurfaceSlot(slots, "top.brand")}</div>
      <nav className={`${styles.primaryNav} ${styles.primaryNavWithMobileMenu}`}>
        {getSurfaceSlot(slots, "top.primaryNav")}
      </nav>
      <div className={styles.utility}>
        <ImplementerMenu
          pageHttpApiHref={httpApiDocsUrl}
          httpApiReferenceVisible={httpApiReferenceVisible}
          uiReferenceVisible={uiReferenceVisible}
        />
        <SettingsButton />
        {helpUrl ? <HelpButton href={helpUrl} /> : null}
        {getSurfaceSlot(slots, "top.user")}
      </div>
    </header>
  );
}
