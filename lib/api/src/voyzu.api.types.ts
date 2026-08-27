import type { NextRequest, NextResponse } from "next/server";
import type {
  ApiCookieDefinition,
  ApiParameterDefinition,
  ApiRequestDefinition,
  ApiResponseDefinition,
  ApiRouteDefinition,
} from "@voyzu/types/api";

export type VoyzuApiRouteHandler = (
  request: NextRequest,
  context: { params: Promise<any> },
) => Promise<NextResponse>;

export interface VoyzuApiModuleRoute extends Omit<ApiRouteDefinition, "loadHandler"> {
  loadHandler: () => Promise<VoyzuApiRouteHandler>;
}

export type VoyzuApiParameterDefinition = ApiParameterDefinition;
export type VoyzuApiCookieDefinition = ApiCookieDefinition;
export type VoyzuApiRequestDefinition = ApiRequestDefinition;
export type VoyzuApiResponseDefinition = ApiResponseDefinition;

export interface VoyzuApiConfig {
  basePath: "/api";
  routes: VoyzuApiModuleRoute[];
}
