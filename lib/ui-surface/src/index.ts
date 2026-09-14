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
} from "./types";

export { resolveExternalUrl } from "./urls";
export {
  detailBackHref,
  detailBackHrefFromSearchParams,
  detailLinkWithBackContext,
  normalizeDetailBackSource,
  type DetailBackSource,
} from "./detail-back-target";
