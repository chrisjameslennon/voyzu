import type { ReactNode } from "react";

import type { VoyzuBreadcrumbItem } from "../breadcrumbs";
import type { VoyzuSurfaceSlots } from "../../surface-slots";

export type { VoyzuBreadcrumbItem } from "../breadcrumbs";

export type {
  VoyzuSurfaceSlotId,
  VoyzuSurfaceSlotProps,
  VoyzuSurfaceSlots,
} from "../../surface-slots";
export {
  VOYZU_LEFT_SLOT_IDS,
  VOYZU_SURFACE_SLOT_IDS,
  VOYZU_TOP_SLOT_IDS,
  VOYZU_TOP_UTILITY_SLOT_IDS,
  getSurfaceSlot,
  hasSurfaceSlot,
} from "../../surface-slots";

export interface VoyzuSurfaceHelpPathContext {
  path: string;
  params: Readonly<Record<string, string>>;
  searchParams: Readonly<Record<string, string>>;
}

export interface VoyzuSurfaceRoute {
  id: string;
  packageName?: string;
  path: string;
  pageTitle: string;
  Page: (props: Record<string, unknown>) => ReactNode | Promise<ReactNode>;
  breadcrumbBase?: VoyzuBreadcrumbItem[];
  helpBaseUrl?: string;
  helpPath?: string;
  helpPathResolver?: (context: VoyzuSurfaceHelpPathContext) => string | undefined;
  apiDocsUrl?: string;
  unframed?: boolean;
  auth?: VoyzuSurfaceRouteAuth;
}

export type VoyzuSurfaceRole = "COMPANY_USER" | "ORGANIZATION_USER" | "ADMIN";

export interface VoyzuSurfaceRouteAuth {
  required?: boolean;
  minRole?: VoyzuSurfaceRole;
}

export interface VoyzuSurfaceUserAccess {
  role?: string;
  accessMode?: string;
  status?: string;
}

export interface VoyzuSurfaceAccessContext {
  path: string;
  route: VoyzuSurfaceRoute;
  user: VoyzuSurfaceUserAccess | null;
}

export type VoyzuSurfaceAccessResult = "allow" | "unauthenticated" | "denied";

export interface VoyzuSurfaceNavItem {
  label: string;
  icon?: string;
  routeId?: string;
  path?: string;
  exactMatch?: boolean;
  children?: VoyzuSurfaceNavItem[];
}

export interface VoyzuSurfaceNavGroup {
  label?: string;
  items: VoyzuSurfaceNavItem[];
}

export interface VoyzuSurfaceMainProps {
  children: ReactNode;
}

export type VoyzuSurfaceMainComponent = (
  props: VoyzuSurfaceMainProps,
) => ReactNode | Promise<ReactNode>;

export interface VoyzuSurfaceMainRegistration {
  routeIds: readonly string[];
  Main: VoyzuSurfaceMainComponent;
}

export interface VoyzuSurfaceLeftNavHeaderProps {
  isCollapsed: boolean;
}

export interface VoyzuUiDomain {
  id: string;
  label: string;
  topNavItem: {
    label: string;
    routeId: string;
  };
  pageRoutes: readonly VoyzuSurfaceRoute[];
  leftNav: readonly VoyzuSurfaceNavGroup[];
  Main?: VoyzuSurfaceMainComponent;
}

export interface VoyzuComposedSurfaceDomain {
  id: string;
  packageName: string;
  label: string;
  defaultPath: string;
  routePaths: Array<{ id: string; path: string }>;
  leftNav: VoyzuSurfaceNavGroup[];
}

export interface VoyzuSurfaceConfig {
  slots: VoyzuSurfaceSlots;
  pageRoutes: VoyzuSurfaceRoute[];
  leftNav: VoyzuSurfaceNavGroup[];
  leftNavRouteIds?: readonly string[];
  mainRegistrations?: readonly VoyzuSurfaceMainRegistration[];
}
