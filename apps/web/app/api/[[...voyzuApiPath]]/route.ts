import { createVoyzuApiRouteHandlers } from "@voyzu/api";
import { withApiBasicAuthContext } from "@voyzu/auth/auth/server/api-basic-auth";

import { voyzuApiConfig } from "../voyzu.api.config";

export const { GET, POST, PUT, PATCH, DELETE } = createVoyzuApiRouteHandlers(voyzuApiConfig, {
  withRequestContext: (request, _route, callback) => withApiBasicAuthContext(request, callback),
});
