import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceNavGroup,
} from "@voyzu/ui-surface/types";

import type { SurfaceRoutePath } from "./common/nav";
import { SurfaceLeftNavClient } from "./SurfaceLeftNavClient";
import { managedPackageDomains } from "./packages/managedPackageDomains";

interface SurfaceLeftNavProps {
  settingsRoutePaths: SurfaceRoutePath[];
  settingsLeftNav: VoyzuSurfaceNavGroup[];
  packageDomains: VoyzuComposedSurfaceDomain[];
}

export async function SurfaceLeftNav(props: SurfaceLeftNavProps) {
  return (
    <SurfaceLeftNavClient
      {...props}
      navigationDomains={await managedPackageDomains(props.packageDomains)}
    />
  );
}
