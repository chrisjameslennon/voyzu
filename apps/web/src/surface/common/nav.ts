import type { NavItem } from "@voyzu/ui-components";
import type { VoyzuSurfaceNavItem } from "@voyzu/ui-surface/types";

export interface SurfaceRoutePath {
  id: string;
  path: string;
}

export function toNavItem(
  item: VoyzuSurfaceNavItem,
  routePathById: Map<string, string>,
): NavItem {
  const path = item.path ?? (item.routeId ? routePathById.get(item.routeId) : undefined) ?? `#${item.label}`;

  return {
    label: item.label,
    icon: item.icon ?? "",
    path,
    exactMatch: item.exactMatch,
    children: item.children?.map((child) => toNavItem(child, routePathById)),
  };
}
