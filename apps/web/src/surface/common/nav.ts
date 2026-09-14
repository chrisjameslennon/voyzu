import type { NavItem } from "@voyzu/ui-components";
import type { VoyzuSurfaceNavItem } from "@voyzu/ui-surface/types";

export interface SurfaceRoutePath {
  id: string;
  rootPath?: string;
  packageName?: string;
  path: string;
}

export function toNavItem(
  item: VoyzuSurfaceNavItem,
  routePathById: Map<string, string>,
): NavItem {
  const path = item.path ?? (item.routeId ? routePathById.get(item.routeId) : undefined) ?? `#${item.id ?? item.label}`;

  return {
    id: item.id,
    label: item.label,
    icon: item.icon ?? "",
    path,
    exactMatch: item.exactMatch,
    children: item.children?.map((child) => toNavItem(child, routePathById)),
  };
}

export function matchesPagePath(pathname: string, pattern: string) {
  const route = pattern.split("/"), path = pathname.split("/");
  return route.length === path.length && route.every((segment, index) => /^\[[^\]]+\]$/.test(segment) || segment === path[index]);
}

export function activeNavigationArea<T extends { routePaths: { path: string }[] }>(areas: T[], pathname: string): T | undefined {
  return areas.flatMap(area => area.routePaths.filter(route => matchesPagePath(pathname, route.path)).map(route => ({ area, path: route.path })))
    .sort((a, b) => {
      const left = a.path.split("/"), right = b.path.split("/");
      for (let i = 0; i < left.length; i++) {
        const diff = Number(left[i].startsWith("[")) - Number(right[i].startsWith("["));
        if (diff) return diff;
      }
      return 0;
    })[0]?.area;
}
