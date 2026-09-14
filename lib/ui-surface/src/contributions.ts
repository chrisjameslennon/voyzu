import type { UiSurface, UiSurfaceMenuGroup, UiSurfaceMenuItem } from "@voyzu/types/ui-surface";
import type { RegisteredPageRoute } from "@voyzu/types/page-routing";
import type { VoyzuComposedSurfaceDomain, VoyzuSurfaceNavGroup, VoyzuSurfaceNavItem } from "./types";

export interface SurfaceRegistration {
  packageName: string;
  roots: readonly string[];
  surface: UiSurface;
}

const within = (path: string, root: string) => path === root || path.startsWith(root + "/");

export function validateUiSurfaces(registrations: readonly SurfaceRegistration[], routes: readonly RegisteredPageRoute[]) {
  const fail = (message: string): never => { throw new Error(`UI surface: ${message}`); };
  const object = (value: unknown, label: string) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object.`);
  };
  const text = (value: unknown, label: string) => {
    if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string.`);
  };
  const routeById = new Map(routes.map(route => [route.id, route]));
  const topIds = new Set<string>();
  const menuIds = new Map<string, Set<string>>();
  for (const { packageName, roots, surface } of registrations) {
    object(surface, packageName);
    for (const slot of Object.keys(surface)) if (!["topnav.menu", "leftnav.menu", "leftnav.header"].includes(slot)) fail(`${packageName} has unknown slot ${slot}.`);
    const topRoots = new Set<string>();
    object(surface["topnav.menu"] ?? {}, `${packageName} topnav.menu`);
    for (const [id, item] of Object.entries(surface["topnav.menu"] ?? {})) {
      text(id, "top-menu ID"); object(item, id); text(item.label, `${id} label`);
      if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(id)) fail(`${id} is not a valid top-menu ID.`);
      if ("icon" in item) fail(`${id}: top-navigation items do not support icons.`);
      if (topIds.has(id)) fail(`duplicate top-menu ID ${id}.`);
      topIds.add(id);
      const route = routeById.get(item.routeId);
      if (!route || route.packageName !== packageName) fail(`${id} must target a page owned by ${packageName}.`);
      const root = route!.rootPath;
      if (topRoots.has(root)) fail(`${packageName} has multiple top-menu items for ${root}.`);
      topRoots.add(root);
    }
    for (const slot of ["leftnav.menu", "leftnav.header"] as const) {
      object(surface[slot] ?? {}, `${packageName} ${slot}`);
      for (const [root, contribution] of Object.entries(surface[slot] ?? {})) {
        object(contribution, `${packageName} ${slot} ${root}`);
        if (!(slot === "leftnav.menu" && root === "/settings") && !roots.includes(root)) fail(`${packageName} cannot contribute to ${root}; it does not own that root.`);
      }
    }
    for (const [root, { content }] of Object.entries(surface["leftnav.menu"] ?? {})) {
      if (!Array.isArray(content)) fail(`${packageName} ${root} content must be an array of menu groups.`);
      const menuKey = root === "/settings" ? root : `${packageName}:${root}`;
      const ids = menuIds.get(menuKey) ?? new Set<string>();
      menuIds.set(menuKey, ids);
      const visit = (items: Readonly<Record<string, UiSurfaceMenuItem>>) => {
        object(items, `${packageName} ${root} menu items`);
        for (const [id, item] of Object.entries(items)) {
          text(id, "menu-item ID"); object(item, id); text(item.label, `${id} label`);
          if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(id)) fail(`${id} is not a valid menu-item ID.`);
          if (ids.has(id)) fail(`duplicate menu-item ID ${id} in ${packageName} ${root}.`);
          ids.add(id);
          if ("id" in item) fail(`${id}: use object keys for IDs.`);
          if (item.icon !== undefined) text(item.icon, `${id} icon`);
          if (item.exactMatch !== undefined && typeof item.exactMatch !== "boolean") fail(`${id} exactMatch must be boolean.`);
          if ([item.routeId, item.path, item.children].filter(value => value !== undefined).length !== 1) fail(`${id} must declare exactly one of routeId, path or children.`);
          if (item.path !== undefined) {
            if (typeof item.path !== "string" || /[?#\\]/.test(item.path) || item.path.split("/").some(segment => segment === "." || segment === "..") || !roots.some(root => within(item.path!, root))) {
              fail(`${id}: placeholder paths must stay within a package-owned root.`);
            }
          }
          if (item.routeId !== undefined) {
            const route = routeById.get(item.routeId);
            if (!route || route.packageName !== packageName) fail(`${id} must reference a page owned by ${packageName}.`);
          }
          if (item.children) visit(item.children);
        }
      };
      for (const group of content) {
        object(group, "menu group");
        if (group.label !== undefined) text(group.label, "menu group label");
        visit(group.items);
      }
    }
    for (const [root, header] of Object.entries(surface["leftnav.header"] ?? {})) {
      if (typeof header.loadComponent !== "function") fail(`${packageName} ${root} requires a lazy header loader.`);
    }
  }
}

export function surfaceMenuGroups(groups: readonly UiSurfaceMenuGroup[]): VoyzuSurfaceNavGroup[] {
  const items = (map: Readonly<Record<string, UiSurfaceMenuItem>>): VoyzuSurfaceNavItem[] => Object.entries(map).map(([id, item]) => ({
    ...item, id, children: item.children ? items(item.children) : undefined,
  }));
  return groups.map(group => ({ label: group.label, items: items(group.items) }));
}

export function composeUiSurfaces(registrations: readonly SurfaceRegistration[], routes: readonly RegisteredPageRoute[]) {
  validateUiSurfaces(registrations, routes);
  const areas: VoyzuComposedSurfaceDomain[] = [];
  const settingsMenus: { rootPath: string; packageName: string; groups: VoyzuSurfaceNavGroup[] }[] = [];
  for (const { packageName, surface } of registrations) {
    const ownRoutes = routes.filter(route => route.packageName === packageName);
    const topItems = Object.entries(surface["topnav.menu"] ?? {});
    const rootPaths = new Set([
      ...topItems.map(([, item]) => ownRoutes.find(route => route.id === item.routeId)!.rootPath),
      ...Object.keys(surface["leftnav.menu"] ?? {}),
      ...Object.keys(surface["leftnav.header"] ?? {}),
    ]);
    for (const rootPath of rootPaths) {
      const menu = surface["leftnav.menu"]?.[rootPath];
      if (within(rootPath, "/settings")) {
        if (menu) settingsMenus.push({ rootPath, packageName, groups: surfaceMenuGroups(menu.content) });
        // Settings owns the shared navigation frame, even for a more specific target.
        if (!topItems.some(([, item]) => ownRoutes.find(route => route.id === item.routeId)?.rootPath === rootPath)) continue;
      }
      const rootRoutes = ownRoutes.filter(route => route.rootPath === rootPath);
      const top = topItems.find(([, item]) => rootRoutes.some(route => route.id === item.routeId));
      const defaultRoute = top ? rootRoutes.find(route => route.id === top[1].routeId)! : rootRoutes[0];
      if (!defaultRoute) continue;
      areas.push({
        id: rootPath, rootPath, packageName,
        label: top?.[1].label ?? defaultRoute.pageTitle,
        defaultPath: defaultRoute.path,
        routePaths: rootRoutes.map(({ id, path }) => ({ id, path })),
        linkPaths: ownRoutes.map(({ id, path }) => ({ id, path })),
        leftNav: menu ? surfaceMenuGroups(menu.content) : [],
        topNavigationVisible: !!top,
      });
    }
  }
  return { areas, settingsMenus };
}

export function selectSettingsMenu(menus: ReturnType<typeof composeUiSurfaces>["settingsMenus"], rootPath: string): VoyzuSurfaceNavGroup[] {
  const matching = menus.filter(menu => within(rootPath, menu.rootPath));
  const longest = Math.max(0, ...matching.map(menu => menu.rootPath.length));
  const groups: VoyzuSurfaceNavGroup[] = [];
  for (const menu of matching.filter(menu => menu.rootPath.length === longest)) for (const group of menu.groups) {
    const label = group.label ?? "Settings";
    const existing = groups.find(item => item.label === label);
    if (existing) existing.items.push(...group.items);
    else groups.push({ label, items: [...group.items] });
  }
  return groups;
}
