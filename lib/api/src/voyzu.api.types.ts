import type { NextRequest, NextResponse } from "next/server";
import type {
  ApiCookieDefinition,
  ApiParameterDefinition,
  ApiRequestDefinition,
  ApiResponseDefinition,
  ApiRouteDefinition,
} from "@voyzu/types/api";

export interface VoyzuApiModuleRoute extends Omit<ApiRouteDefinition, "handler"> {
  handler: (request: NextRequest, context: { params: Promise<any> }) => Promise<NextResponse>;
}

export type VoyzuApiParameterDefinition = ApiParameterDefinition;
export type VoyzuApiCookieDefinition = ApiCookieDefinition;
export type VoyzuApiRequestDefinition = ApiRequestDefinition;
export type VoyzuApiResponseDefinition = ApiResponseDefinition;

export interface VoyzuApiModule {
  apiDefinitions: Record<string, VoyzuApiModuleRoute>;
}

export interface VoyzuApiConfig {
  basePath: "/api";
  modules: VoyzuApiModule[];
}
