import "server-only";

export {
  createVoyzuPageRenderer,
  createVoyzuSurfaceRouter,
} from "./router";
export type {
  CreateVoyzuPageRendererOptions,
  CreateVoyzuSurfaceRouterOptions,
  SurfaceFrameProps,
  VoyzuSurfacePageContext,
  VoyzuSurfaceRouteContext,
} from "./router";

export type {
  VoyzuSurfaceAccessContext,
  VoyzuSurfaceAccessResult,
  VoyzuSurfaceConfig,
  RegisteredPageRoute,
  VoyzuSurfaceUserAccess,
} from "../types";

export {
  detailBackHref,
  detailBackHrefFromSearchParams,
  detailLinkWithBackContext,
  normalizeDetailBackSource,
  type DetailBackSource,
} from "../detail-back-target";
