import { NextResponse, type NextRequest } from "next/server";

import type { VoyzuApiModuleRoute } from "./voyzu.api.types";
import { validateApiRequest, validateApiResponse } from "./validation";

export interface VoyzuApiRouteContext {
  params: Promise<Record<string, string>>;
}

export interface HandleVoyzuApiRouteOptions {
  withRequestContext?: (
    request: NextRequest,
    route: VoyzuApiModuleRoute,
    callback: () => Promise<NextResponse>,
  ) => Promise<NextResponse>;
}

export async function handleVoyzuApiRoute(
  route: VoyzuApiModuleRoute,
  request: NextRequest,
  context: VoyzuApiRouteContext,
  options: HandleVoyzuApiRouteOptions = {},
): Promise<NextResponse> {
  const params = await context.params;
  const invalidRequest = await validateApiRequest(request, route, params);
  if (invalidRequest) return invalidRequest;

  const handle = () => route.handler(request, { params: Promise.resolve(params) });
  let response: NextResponse;
  try {
    response = options.withRequestContext
      ? await options.withRequestContext(request, route, handle)
      : await handle();
  } catch (error) {
    console.error(`Unhandled ${route.method} ${route.path} error`, error);
    response = NextResponse.json(
      { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
  return validateApiResponse(response, route);
}
