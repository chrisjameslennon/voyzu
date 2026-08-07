"use client";

export { DetailBackButton, type DetailBackButtonProps } from "./DetailBackButton";
export {
  detailBackHref,
  detailBackHrefFromSearchParams,
  detailLinkWithBackContext,
  normalizeDetailBackSource,
  type DetailBackSource,
} from "../detail-back-target";

export {
  VOYZU_LEFT_SLOT_IDS,
  VOYZU_SURFACE_SLOT_IDS,
  VOYZU_TOP_SLOT_IDS,
  VOYZU_TOP_UTILITY_SLOT_IDS,
  getSurfaceSlot,
  hasSurfaceSlot,
} from "../types";

export type {
  VoyzuBreadcrumbItem,
  VoyzuSurfaceAccessContext,
  VoyzuSurfaceAccessResult,
  VoyzuSurfaceConfig,
  VoyzuSurfaceMainComponent,
  VoyzuSurfaceMainProps,
  VoyzuSurfaceMainRegistration,
  VoyzuSurfaceLeftNavHeaderProps,
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRole,
  VoyzuSurfaceRoute,
  VoyzuSurfaceRouteAuth,
  VoyzuSurfaceSlotId,
  VoyzuSurfaceSlotProps,
  VoyzuSurfaceSlots,
  VoyzuSurfaceUserAccess,
  VoyzuUiDomain,
} from "../types";
