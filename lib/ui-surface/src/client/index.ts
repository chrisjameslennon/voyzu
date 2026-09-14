"use client";
export { AccessProvider, useCurrentAccess } from "./access";

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
  VoyzuSurfaceNavGroup,
  VoyzuSurfaceNavItem,
  VoyzuSurfaceRole,
  RegisteredPageRoute,
  VoyzuSurfaceRouteAuth,
  VoyzuSurfaceSlotId,
  VoyzuSurfaceSlotProps,
  VoyzuSurfaceSlots,
  VoyzuSurfaceUserAccess,
} from "../types";
