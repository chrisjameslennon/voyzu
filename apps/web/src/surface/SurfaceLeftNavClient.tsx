"use client";

import { usePathname } from "next/navigation";

import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceNavGroup,
} from "@voyzu/ui-surface/types";

import { PackageLeftNav } from "./packages/PackageLeftNav";
import { SettingsLeftNav } from "./left-navs/settings/SettingsLeftNav";
import { matchesPagePath } from "./common/nav";
import type { SurfaceRoutePath } from "./common/nav";

interface SurfaceLeftNavClientProps {
  settingsRoutePaths: SurfaceRoutePath[];
  settingsLeftNav: VoyzuSurfaceNavGroup[];
  settingsMenusByRoot: Record<string, VoyzuSurfaceNavGroup[]>;
  packageDomains: VoyzuComposedSurfaceDomain[];
  navigationDomains: VoyzuComposedSurfaceDomain[];
}

export function SurfaceLeftNavClient({
  settingsRoutePaths,
  settingsLeftNav,
  settingsMenusByRoot,
  packageDomains,
  navigationDomains,
}: SurfaceLeftNavClientProps) {
  const pathname = usePathname();

  if (pathname !== "/settings" && !pathname.startsWith("/settings/")) {
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
      leftNav={settingsMenusByRoot[settingsRoutePaths.find(route => matchesPagePath(pathname, route.path))?.rootPath ?? ""] ?? settingsLeftNav}
      navigationDomains={navigationDomains}
    />
  );
}
