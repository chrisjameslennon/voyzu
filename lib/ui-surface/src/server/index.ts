import "server-only";

export { ComponentSlot, component } from "./components";
export type {
  VoyzuComponent,
  VoyzuComponentDefinition,
  VoyzuComponentLoader,
} from "./components";

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
