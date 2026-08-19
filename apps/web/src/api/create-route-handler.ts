import type { NextRequest } from "next/server";

import {
  handleVoyzuApiRoute,
  type VoyzuApiModuleRoute,
  type VoyzuApiRouteContext,
} from "@voyzu/api";
import { withApiBasicAuthContext } from "@voyzu/auth/auth/server";

export function createApiRouteHandler(route: VoyzuApiModuleRoute) {
  return (request: NextRequest, context: VoyzuApiRouteContext) =>
    handleVoyzuApiRoute(route, request, context, {
      withRequestContext: (nextRequest, _route, callback) =>
        withApiBasicAuthContext(nextRequest, callback),
    });
}
