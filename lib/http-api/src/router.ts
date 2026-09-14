import { NextResponse, type NextRequest } from "next/server";

import type { VoyzuHttpApiConfig, VoyzuHttpApiRoute } from "./voyzu.http-api.types";
import { validateHttpApiRequest, validateHttpApiResponse } from "./validation";

export interface VoyzuHttpApiRouteContext {
  params: Promise<{
    voyzuHttpApiPath?: string[];
  }>;
}

export interface VoyzuHttpApiMatchedRouteContext {
  params: Promise<Record<string, string>>;
}

export interface HandleVoyzuHttpApiRouteOptions {
  withRequestContext?: (
    request: NextRequest,
    route: VoyzuHttpApiRoute,
    callback: () => Promise<NextResponse>,
  ) => Promise<NextResponse>;
}

export type CreateVoyzuHttpApiRouteHandlersOptions = HandleVoyzuHttpApiRouteOptions;

async function resolveHttpApiPath(params: VoyzuHttpApiRouteContext["params"]): Promise<string> {
  const { voyzuHttpApiPath } = await params;
  return "/" + (voyzuHttpApiPath ?? []).join("/");
}

function matchHttpApiRoute(
  config: VoyzuHttpApiConfig,
  path: string,
  method: string,
): { route: VoyzuHttpApiRoute; params: Record<string, string> } | null {
  for (const route of config.routes) {
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
      } else if (routePart !== pathPart) {
        matches = false;
        break;
      }
    }
    if (matches) return { route, params };
  }
  return null;
}

export async function handleVoyzuHttpApiRoute(
  route: VoyzuHttpApiRoute,
  request: NextRequest,
  context: VoyzuHttpApiMatchedRouteContext,
  options: HandleVoyzuHttpApiRouteOptions = {},
): Promise<NextResponse> {
  const params = await context.params;
  const invalidRequest = await validateHttpApiRequest(request, route, params);
  if (invalidRequest) return invalidRequest;

  const handle = async () => {
    const handler = await route.loadHandler();
    return handler(request, { params: Promise.resolve(params) });
  };
  let response: NextResponse;
  try {
    response = options.withRequestContext
      ? await options.withRequestContext(request, route, handle)
      : await handle();
  } catch (error) {
    console.error(`Unhandled ${route.id} (${route.method} ${route.path}) error`, error);
    response = NextResponse.json(
      { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
  return validateHttpApiResponse(response, route);
}

export async function handleVoyzuHttpApiRequest(
  config: VoyzuHttpApiConfig,
  request: NextRequest,
  context: VoyzuHttpApiRouteContext,
  options: CreateVoyzuHttpApiRouteHandlersOptions = {},
): Promise<NextResponse> {
  const path = await resolveHttpApiPath(context.params);
  const match = matchHttpApiRoute(config, path, request.method);
  if (!match) {
    return NextResponse.json(
      { code: "ENTITY_NOT_FOUND", message: `HTTP API route ${path} was not found` },
      { status: 404 },
    );
  }

  return handleVoyzuHttpApiRoute(
    match.route,
    request,
    { params: Promise.resolve(match.params) },
    options,
  );
}

export function createVoyzuHttpApiRouteHandlers(
  config: VoyzuHttpApiConfig,
  options: CreateVoyzuHttpApiRouteHandlersOptions = {},
) {
  const handle = (request: NextRequest, context: VoyzuHttpApiRouteContext) =>
    handleVoyzuHttpApiRequest(config, request, context, options);
  return { GET: handle, POST: handle, PUT: handle, PATCH: handle, DELETE: handle };
}
