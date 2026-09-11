import type { ReactNode } from "react";
import { capabilities } from "@voyzu/capability/contracts";
import { AccessProvider } from "@voyzu/ui-surface/client";

import {
  getSurfaceSlot,
  type VoyzuSurfaceMainComponent,
  type VoyzuSurfaceRoute,
  type VoyzuSurfaceSlots,
} from "@voyzu/ui-surface/types";

import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { SurfaceTopNav } from "./SurfaceTopNav";

interface SurfaceFrameProps {
  slots: VoyzuSurfaceSlots;
  activeRoute?: VoyzuSurfaceRoute;
  showLeftNav: boolean;
  Main?: VoyzuSurfaceMainComponent;
  children: ReactNode;
}

export async function SurfaceFrame({
  slots,
  activeRoute,
  showLeftNav,
  Main,
  children,
}: SurfaceFrameProps) {
  // Refreshed with the page render/navigation, not cached in a persistent root layout.
  const identity = await capabilities.optional("platform.identity")?.getCurrentIdentity({}) ?? null;
  return (
    <AccessProvider identity={identity}>
    <div className={styles.frame}>
      <SurfaceTopNav
        slots={slots}
        activeRoute={activeRoute}
      />
      <aside
        className={`${styles.left} ${!showLeftNav || Main ? styles.leftMobileOnly : ""}`}
      >
        {getSurfaceSlot(slots, "left.nav")}
      </aside>
      {Main ? (
        <div className={styles.domainMain}>
          <Main>{children}</Main>
        </div>
      ) : (
        <main className={styles.main}>{children}</main>
      )}
    </div>
    </AccessProvider>
  );
}
