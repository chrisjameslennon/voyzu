import {
  handleLogin,
  handleLogout,
  handleMe,
} from "./server/auth.http.handlers";
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { LoginRoutePage } from "./server/pages/LoginRoutePage";

type DtoSchemaRef = {
  $ref: `#/components/schemas/${string}`;
};

function dtoRef(dtoName: string): DtoSchemaRef {
  return {
    $ref: `#/components/schemas/${dtoName}`,
  };
}

export const authModule = {
  pageRoutes: {
    login: {
      id: "voyzu.auth.page.login",
      path: "/login",
      Page: LoginRoutePage,
      pageTitle: "Sign in",
      unframed: true,
      auth: { required: false },
    },
  },
  apiDefinitions: {
    login: {
      method: "POST",
      path: "/auth/session",
      handler: handleLogin,
      apiDoc: {
        summary: "Log in",
        description: "Authenticates a UI user and creates an authenticated session cookie.",
        tags: ["Auth"],
        requestBody: {
          required: true,
          schema: dtoRef("AuthLoginRequestDto"),
        },
        responses: {
          "200": {
            description: "The authenticated user.",
            schema: dtoRef("AuthLoginResponseDto"),
            cookies: {
              voyzu_auth: {
                description: "Authenticated UI session cookie.",
                action: "set",
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/",
                maxAgeSeconds: 28800,
              },
            },
          },
          "401": { description: "Login credentials were invalid.", schema: dtoRef("UnauthorizedErrorResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") },
        },
      },
    },
    logout: {
      method: "DELETE",
      path: "/auth/session",
      handler: handleLogout,
      apiDoc: {
        summary: "Log out",
        description: "Clears the authenticated UI session cookie.",
        tags: ["Auth"],
        responses: {
          "200": {
            description: "The session has been cleared.",
            schema: dtoRef("AuthSessionResponseDto"),
            cookies: {
              voyzu_auth: {
                description: "Authenticated UI session cookie cleared by setting an expired cookie.",
                action: "clear",
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/",
                maxAgeSeconds: 0,
              },
            },
          },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") },
        },
      },
    },
    me: {
      method: "GET",
      path: "/auth/session",
      handler: handleMe,
      apiDoc: {
        summary: "Get current session",
        description: "Returns the current UI authentication session state.",
        tags: ["Auth"],
        responses: {
          "200": { description: "The current session state.", schema: dtoRef("AuthSessionResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") },
        },
      },
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;

export default authModule;
