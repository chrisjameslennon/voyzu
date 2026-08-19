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

const commonResponses = {
  "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") },
  "401": { description: "Authentication failed.", body: dtoRef("UnauthorizedErrorResponseDto") },
  "403": { description: "Access is forbidden.", body: dtoRef("ForbiddenErrorResponseDto") },
  "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
} as const;

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
      request: { contentType: "application/json", body: dtoRef("AuthLoginRequestDto") },
      summary: "Log in",
      description: "Authenticates a UI user and creates an authenticated session cookie.",
      tags: ["Auth"],
      responses: {
        ...commonResponses,
        "200": {
          description: "The authenticated user.",
          body: dtoRef("AuthLoginResponseDto"),
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
        "401": { description: "Login credentials were invalid.", body: dtoRef("UnauthorizedErrorResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
      }
    },
    logout: {
      method: "DELETE",
      path: "/auth/session",
      handler: handleLogout,
      summary: "Log out",
      description: "Clears the authenticated UI session cookie.",
      tags: ["Auth"],
      responses: {
        ...commonResponses,
        "200": {
          description: "The session has been cleared.",
          body: dtoRef("AuthSessionResponseDto"),
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
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
      }
    },
    me: {
      method: "GET",
      path: "/auth/session",
      handler: handleMe,
      summary: "Get current session",
      description: "Returns the current UI authentication session state.",
      tags: ["Auth"],
      responses: {
        ...commonResponses,
        "200": { description: "The current session state.", body: dtoRef("AuthSessionResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
      }
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;

export default authModule;
