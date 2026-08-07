"use client";

import { usePathname } from "next/navigation";

import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceNavGroup,
} from "@voyzu/ui-surface/types";

import { PackageLeftNav } from "./packages/PackageLeftNav";
import { SettingsLeftNav } from "./left-navs/settings/SettingsLeftNav";
import type { SurfaceRoutePath } from "./common/nav";

interface SurfaceLeftNavClientProps {
  settingsRoutePaths: SurfaceRoutePath[];
  settingsLeftNav: VoyzuSurfaceNavGroup[];
  packageDomains: VoyzuComposedSurfaceDomain[];
  navigationDomains: VoyzuComposedSurfaceDomain[];
}

export function SurfaceLeftNavClient({
  settingsRoutePaths,
  settingsLeftNav,
  packageDomains,
  navigationDomains,
}: SurfaceLeftNavClientProps) {
  const pathname = usePathname();

  if (!pathname.startsWith("/settings")) {
    return (
      <PackageLeftNav
        domains={packageDomains}
        navigationDomains={navigationDomains}
      />
    );
  }

  return (
    <SettingsLeftNav
      routePaths={settingsRoutePaths}
      leftNav={settingsLeftNav}
      navigationDomains={navigationDomains}
    />
  );
}
