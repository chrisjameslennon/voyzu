import { NextResponse, type NextRequest } from "next/server";

import type { VoyzuApiConfig, VoyzuApiModuleRoute } from "./voyzu.api.types";
import { validateApiRequest, validateApiResponse } from "./validation";

export interface VoyzuApiRouteContext {
  params: Promise<{
    voyzuApiPath?: string[];
  }>;
}

export interface CreateVoyzuApiRouteHandlersOptions {
  withRequestContext?: (
    request: NextRequest,
    route: VoyzuApiModuleRoute,
    callback: () => Promise<NextResponse>,
  ) => Promise<NextResponse>;
}

async function resolveApiPath(params: VoyzuApiRouteContext["params"]): Promise<string> {
  const { voyzuApiPath } = await params;
  return "/" + (voyzuApiPath ?? []).join("/");
}

function matchApiRoute(
  config: VoyzuApiConfig,
  path: string,
  method: string,
): { route: VoyzuApiModuleRoute; params: Record<string, string> } | null {
  const routes = config.modules.flatMap((module) => Object.values(module.apiDefinitions));
  for (const route of routes) {
    if (route.method !== method) continue;

    const routeParts = route.path.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);

    if (routeParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;

    for (let index = 0; index < routeParts.length; index += 1) {
      const routePart = routeParts[index];
      const pathPart = pathParts[index];

      if (routePart.startsWith("[") && routePart.endsWith("]")) {
        params[routePart.slice(1, -1)] = pathPart;
        continue;
      }

      if (routePart !== pathPart) {
        matches = false;
        break;
      }
    }

    if (matches) return { route, params };
  }

  return null;
}

export async function handleVoyzuApiRequest(
  config: VoyzuApiConfig,
  request: NextRequest,
  context: VoyzuApiRouteContext,
  options: CreateVoyzuApiRouteHandlersOptions = {},
): Promise<NextResponse> {
  const path = await resolveApiPath(context.params);
  const method = request.method;
  const match = matchApiRoute(config, path, method);

  if (!match) {
    return NextResponse.json(
      {
        code: "ENTITY_NOT_FOUND",
        message: `API route ${path} was not found`,
      },
      { status: 404 },
    );
  }

  const { route, params } = match;
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

export function createVoyzuApiRouteHandlers(
  config: VoyzuApiConfig,
  options: CreateVoyzuApiRouteHandlersOptions = {},
) {
  return {
    GET: (request: NextRequest, context: VoyzuApiRouteContext) =>
      handleVoyzuApiRequest(config, request, context, options),
    POST: (request: NextRequest, context: VoyzuApiRouteContext) =>
      handleVoyzuApiRequest(config, request, context, options),
    PUT: (request: NextRequest, context: VoyzuApiRouteContext) =>
      handleVoyzuApiRequest(config, request, context, options),
    PATCH: (request: NextRequest, context: VoyzuApiRouteContext) =>
      handleVoyzuApiRequest(config, request, context, options),
    DELETE: (request: NextRequest, context: VoyzuApiRouteContext) =>
      handleVoyzuApiRequest(config, request, context, options),
  };
}
