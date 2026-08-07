import "server-only";

export {
  createVoyzuSurfaceRouter,
} from "./router";
export type {
  CreateVoyzuSurfaceRouterOptions,
  SurfaceFrameProps,
  VoyzuSurfaceRouteContext,
} from "./router";

export type {
  VoyzuSurfaceAccessContext,
  VoyzuSurfaceAccessResult,
  VoyzuSurfaceConfig,
  VoyzuSurfaceRoute,
  VoyzuSurfaceUserAccess,
} from "../types";

export {
  detailBackHref,
  detailBackHrefFromSearchParams,
  detailLinkWithBackContext,
  normalizeDetailBackSource,
  type DetailBackSource,
} from "../detail-back-target";
