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

export type { RegisteredPageRoute } from "@voyzu/types/page-routing";
import type { RegisteredPageRoute } from "@voyzu/types/page-routing";

export type VoyzuSurfaceRole = "STANDARD" | "ADMIN";

export interface VoyzuSurfaceRouteAuth {
  required?: boolean;
  minRole?: VoyzuSurfaceRole;
  authorize?: (
    context: VoyzuSurfaceAccessContext,
  ) => VoyzuSurfaceAccessResult | Promise<VoyzuSurfaceAccessResult>;
}

export interface VoyzuSurfaceUserAccess {
  role?: string;
  accessMode?: string;
  status?: string;
}

export interface VoyzuSurfaceAccessContext {
  path: string;
  route: RegisteredPageRoute;
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
  slotId?: string;
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
  domainId: string;
}

export interface VoyzuUiDomain {
  id: string;
  label: string;
  topNavItem: {
    label: string;
    routeId: string;
  };
  pageRoutes: readonly RegisteredPageRoute[];
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
  topNavigationVisible?: boolean;
}

export interface VoyzuSurfaceConfig {
  slots: VoyzuSurfaceSlots;
  pageRoutes: RegisteredPageRoute[];
  leftNav: VoyzuSurfaceNavGroup[];
  leftNavRouteIds?: readonly string[];
  mainRegistrations?: readonly VoyzuSurfaceMainRegistration[];
}
