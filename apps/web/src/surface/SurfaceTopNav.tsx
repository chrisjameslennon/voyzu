import {
  getSurfaceSlot,
  type VoyzuSurfaceRoute,
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
  activeRoute?: VoyzuSurfaceRoute;
}

export async function SurfaceTopNav({ slots, activeRoute }: SurfaceTopNavProps) {
  const helpUrl = activeRoute?.helpBaseUrl && activeRoute.helpPath
    ? resolveExternalUrl(activeRoute.helpBaseUrl, activeRoute.helpPath)
    : undefined;
  const [apiReferenceVisible, uiReferenceVisible] = await Promise.all([
    areInstalledPackagePageRoutesVisible("@voyzu/api-reference"),
    areInstalledPackagePageRoutesVisible("@voyzu/ui-reference"),
  ]);
  const apiDocsUrl = activeRoute?.apiDocsUrl
    && apiReferenceVisible
    ? activeRoute.apiDocsUrl
    : undefined;

  return (
    <header className={styles.top}>
      <div className={styles.brand}>{getSurfaceSlot(slots, "top.brand")}</div>
      <nav className={`${styles.primaryNav} ${styles.primaryNavWithMobileMenu}`}>
        {getSurfaceSlot(slots, "top.primaryNav")}
      </nav>
      <div className={styles.utility}>
        <ImplementerMenu
          pageApiHref={apiDocsUrl}
          apiReferenceVisible={apiReferenceVisible}
          uiReferenceVisible={uiReferenceVisible}
        />
        <SettingsButton />
        {helpUrl ? <HelpButton href={helpUrl} /> : null}
        {getSurfaceSlot(slots, "top.user")}
      </div>
    </header>
  );
}
