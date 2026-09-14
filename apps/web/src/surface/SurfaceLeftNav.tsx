import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceNavGroup,
} from "@voyzu/ui-surface/types";

import type { SurfaceRoutePath } from "./common/nav";
import { SurfaceLeftNavClient } from "./SurfaceLeftNavClient";
import { managedPackageDomains, orderPackageContributions } from "./packages/managedPackageDomains";
import { selectSettingsMenu, type composeUiSurfaces } from "@voyzu/ui-surface/contributions";

interface SurfaceLeftNavProps {
  settingsRoutePaths: SurfaceRoutePath[];
  settingsLeftNav: VoyzuSurfaceNavGroup[];
  settingsMenusByRoot: Record<string, VoyzuSurfaceNavGroup[]>;
  settingsContributions: ReturnType<typeof composeUiSurfaces>["settingsMenus"];
  packageDomains: VoyzuComposedSurfaceDomain[];
}

export async function SurfaceLeftNav(props: SurfaceLeftNavProps) {
  const { settingsContributions, ...clientProps } = props;
  const menus = await orderPackageContributions(settingsContributions);
  return (
    <SurfaceLeftNavClient
      {...clientProps}
      settingsLeftNav={selectSettingsMenu(menus, "/settings")}
      settingsMenusByRoot={Object.fromEntries(Object.keys(props.settingsMenusByRoot).map(root => [root, selectSettingsMenu(menus, root)]))}
      navigationDomains={await managedPackageDomains(props.packageDomains.filter(area => area.topNavigationVisible !== false))}
    />
  );
}
