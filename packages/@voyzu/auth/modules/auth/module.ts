import Type from "typebox";
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthSessionResponseDto,
} from "@voyzu/auth/types";
import {
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types";
import {
  handleLogin,
  handleLogout,
  handleMe,
} from "./server/auth.http.handlers";
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { LoginRoutePage } from "./server/pages/LoginRoutePage";

const commonResponses = {
  "400": {
    description: "Validation failed.",
    body: InputValidationErrorResponseDto,
  },
  "401": {
    description: "Authentication failed.",
    body: UnauthorizedErrorResponseDto,
  },
  "403": {
    description: "Access is forbidden.",
    body: ForbiddenErrorResponseDto,
  },
  "500": {
    description: "An unexpected server error occurred.",
    body: InternalServerErrorResponseDto,
  },
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
      request: {
        contentType: "application/json",
        body: AuthLoginRequestDto,
      },
      summary: "Log in",
      description:
        "Authenticates a UI user and creates an authenticated session cookie.",
      tags: ["Auth"],
      responses: {
        ...commonResponses,
        "200": {
          description: "The authenticated user.",
          body: AuthLoginResponseDto,
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
        "401": {
          description: "Login credentials were invalid.",
          body: UnauthorizedErrorResponseDto,
        },
        "500": {
          description: "An unexpected server error occurred.",
          body: InternalServerErrorResponseDto,
        },
      },
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
          body: AuthSessionResponseDto,
          cookies: {
            voyzu_auth: {
              description:
                "Authenticated UI session cookie cleared by setting an expired cookie.",
              action: "clear",
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
              maxAgeSeconds: 0,
            },
          },
        },
        "500": {
          description: "An unexpected server error occurred.",
          body: InternalServerErrorResponseDto,
        },
      },
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
        "200": {
          description: "The current session state.",
          body: AuthSessionResponseDto,
        },
        "500": {
          description: "An unexpected server error occurred.",
          body: InternalServerErrorResponseDto,
        },
      },
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;

export default authModule;
