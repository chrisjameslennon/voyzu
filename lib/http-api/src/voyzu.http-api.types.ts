import type { NextRequest, NextResponse } from "next/server";
import type {
  HttpApiCookieDefinition,
  HttpApiParameterDefinition,
  HttpApiRequestDefinition,
  HttpApiResponseDefinition,
  HttpApiRegisteredRoute,
} from "@voyzu/types/http-api";

export type VoyzuHttpApiRouteHandler = (
  request: NextRequest,
  context: { params: Promise<any> },
) => Promise<NextResponse>;

export interface VoyzuHttpApiRoute extends Omit<HttpApiRegisteredRoute, "loadHandler"> {
  loadHandler: () => Promise<VoyzuHttpApiRouteHandler>;
}

export type VoyzuHttpApiParameterDefinition = HttpApiParameterDefinition;
export type VoyzuHttpApiCookieDefinition = HttpApiCookieDefinition;
export type VoyzuHttpApiRequestDefinition = HttpApiRequestDefinition;
export type VoyzuHttpApiResponseDefinition = HttpApiResponseDefinition;

export interface VoyzuHttpApiConfig {
  basePath: "/api";
  routes: VoyzuHttpApiRoute[];
}
