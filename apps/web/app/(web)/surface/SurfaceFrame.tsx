import type { ReactNode } from "react";

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

export function SurfaceFrame({
  slots,
  activeRoute,
  showLeftNav,
  Main,
  children,
}: SurfaceFrameProps) {
  return (
    <div className={styles.frame}>
      <SurfaceTopNav slots={slots} activeRoute={activeRoute} />
      {Main ? (
        <div className={styles.domainMain}>
          <Main>{children}</Main>
        </div>
      ) : (
        <>
          {showLeftNav ? (
            <aside className={styles.left}>
              {getSurfaceSlot(slots, "left.nav")}
            </aside>
          ) : null}
          <main className={styles.main}>{children}</main>
        </>
      )}
    </div>
  );
}
