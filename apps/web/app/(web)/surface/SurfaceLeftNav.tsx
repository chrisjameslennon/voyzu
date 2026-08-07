"use client";

import { usePathname } from "next/navigation";

import type { VoyzuSurfaceNavGroup } from "@voyzu/ui-surface/types";
import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";

import { PackageLeftNav } from "./packages/PackageLeftNav";
import { SettingsLeftNav } from "./left-navs/settings/SettingsLeftNav";
import type { SurfaceRoutePath } from "./common/nav";

interface SurfaceLeftNavProps {
  settingsRoutePaths: SurfaceRoutePath[];
  settingsLeftNav: VoyzuSurfaceNavGroup[];
  packageDomains: VoyzuComposedSurfaceDomain[];
}

export function SurfaceLeftNav({
  settingsRoutePaths,
  settingsLeftNav,
  packageDomains,
}: SurfaceLeftNavProps) {
  const pathname = usePathname();

  if (!pathname.startsWith("/settings")) {
    return <PackageLeftNav domains={packageDomains} />;
  }

  return (
    <SettingsLeftNav
      routePaths={settingsRoutePaths}
      leftNav={settingsLeftNav}
    />
  );
}
