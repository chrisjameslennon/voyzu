import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

const NonBlankString = Type.String({ pattern: "\\S" });
const ApplicationPath = Type.String({ pattern: "^/(?!/)" });
const HomePageRoute = Type.String({
  pattern: "^/(?!/)(?!$)(?!.*[?#\\\\])\\S(?:.*\\S)?$",
  description: "A non-root relative application path without a query string, fragment, or backslash.",
});

export const InstalledPackageResponseDto = StrictObject({
  id: Type.Integer({ minimum: 1 }), code: NonBlankString, description: Type.String(), repository: Type.String(),
  topNavigationVisible: Type.Boolean(), pageRoutesVisible: Type.Boolean(), navOrder: Type.Integer({ minimum: 0 }),
  preinstalled: Type.Boolean(), hasTopNavigation: Type.Boolean(), required: Type.Boolean(),
  pageRootPaths: Type.Array(ApplicationPath), apiRootPaths: Type.Array(ApplicationPath),
});
export type InstalledPackageResponseDto = Type.Static<typeof InstalledPackageResponseDto>;
export const InstalledPackageUpdateRequestDto = StrictObject({ topNavigationVisible: Type.Boolean(), pageRoutesVisible: Type.Boolean() });
export type InstalledPackageUpdateRequestDto = Type.Static<typeof InstalledPackageUpdateRequestDto>;
export const InstalledPackageMoveRequestDto = StrictObject({ direction: Type.Union([Type.Literal("up"), Type.Literal("down")]) });
export type InstalledPackageMoveRequestDto = Type.Static<typeof InstalledPackageMoveRequestDto>;
export const HomePageRouteResponseDto = StrictObject({ route: HomePageRoute });
export type HomePageRouteResponseDto = Type.Static<typeof HomePageRouteResponseDto>;
export const HomePageRouteUpdateRequestDto = StrictObject({ route: HomePageRoute });
export type HomePageRouteUpdateRequestDto = Type.Static<typeof HomePageRouteUpdateRequestDto>;
