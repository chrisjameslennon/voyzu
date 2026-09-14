import { createVoyzuHttpApiRouteHandlers } from "@voyzu/http-api";
import { withHttpApiBasicAuthContext } from "@voyzu/auth/auth/server/http-api-basic-auth";

import { voyzuHttpApiConfig } from "../voyzu.http-api.config";

export const { GET, POST, PUT, PATCH, DELETE } = createVoyzuHttpApiRouteHandlers(voyzuHttpApiConfig, {
  withRequestContext: (request, _route, callback) => withHttpApiBasicAuthContext(request, callback),
});
