import type {
  VoyzuSurfaceAccessContext,
  VoyzuSurfaceAccessResult,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRole,
  VoyzuSurfaceRoute,
  VoyzuSurfaceUserAccess,
} from "@voyzu/ui-surface/types";

const ROLE_RANK: Record<VoyzuSurfaceRole, number> = {
  COMPANY_USER: 1,
  ORGANIZATION_USER: 2,
  ADMIN: 3,
};

function isSurfaceRole(role: string | undefined): role is VoyzuSurfaceRole {
  return role === "COMPANY_USER" || role === "ORGANIZATION_USER" || role === "ADMIN";
}

export function hasUiAccess(user: VoyzuSurfaceUserAccess | null): user is VoyzuSurfaceUserAccess {
  return user?.status === "ACTIVE" && (user.accessMode === "UI" || user.accessMode === "UI_AND_API");
}

export function canAccessRole(
  user: VoyzuSurfaceUserAccess | null,
  minRole: VoyzuSurfaceRole | undefined,
): boolean {
  if (!hasUiAccess(user) || !isSurfaceRole(user.role)) return false;
  if (!minRole) return true;
  return ROLE_RANK[user.role] >= ROLE_RANK[minRole];
}

export function authorizeSurfaceRoute({
  route,
  user,
}: VoyzuSurfaceAccessContext): VoyzuSurfaceAccessResult {
  if (!route.auth?.required) return "allow";
  if (!user) return "unauthenticated";
  return canAccessRole(user, route.auth.minRole) ? "allow" : "denied";
}

function filterNavItem(
  item: VoyzuSurfaceNavItem,
  routeById: Map<string, VoyzuSurfaceRoute>,
  user: VoyzuSurfaceUserAccess | null,
): VoyzuSurfaceNavItem | null {
  const route = item.routeId ? routeById.get(item.routeId) : null;
  const canAccessRoute = !route || !route.auth?.required || canAccessRole(user, route.auth.minRole);
  const children = item.children
    ?.map((child) => filterNavItem(child, routeById, user))
    .filter((child): child is VoyzuSurfaceNavItem => Boolean(child));

  if (!canAccessRoute) return null;
  if (item.children && !children?.length) return null;

  return {
    ...item,
    children,
  };
}

export function filterSurfaceNav(
  groups: VoyzuSurfaceNavGroup[],
  routes: VoyzuSurfaceRoute[],
  user: VoyzuSurfaceUserAccess | null,
): VoyzuSurfaceNavGroup[] {
  const routeById = new Map(routes.map((route) => [route.id, route]));

  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterNavItem(item, routeById, user))
        .filter((item): item is VoyzuSurfaceNavItem => Boolean(item)),
    }))
    .filter((group) => group.items.length > 0);
}
