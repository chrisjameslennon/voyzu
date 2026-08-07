import type { NextRequest, NextResponse } from "next/server";
import type { ApiMethod } from "@voyzu/types/api";

export interface VoyzuApiModuleRoute {
  method: ApiMethod;
  path: string;
  handler: (request: NextRequest, context: { params: Promise<any> }) => Promise<NextResponse>;
  apiDoc?: unknown;
}

export interface VoyzuApiModule {
  apiDefinitions: Record<string, VoyzuApiModuleRoute>;
}

export interface VoyzuApiConfig {
  basePath: "/api";
  modules: VoyzuApiModule[];
}
