import "server-only";

export {
  createVoyzuPageRenderer,
} from "./router";
export type {
  CreateVoyzuPageRendererOptions,
  SurfaceFrameProps,
  VoyzuSurfacePageContext,
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
