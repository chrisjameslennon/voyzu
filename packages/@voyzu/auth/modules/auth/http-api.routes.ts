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

export const httpApiRoutes = {
  "auth.auth.login": {
    description: "Authenticates a UI user and creates an authenticated session cookie.",
    method: "POST",
    path: "/auth/session",
    loadHandler: () => import("./server/auth.http.handlers").then((module) => module.handleLogin),
    request: {
      contentType: "application/json",
      body: AuthLoginRequestDto,
    },
    summary: "Log in",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The authenticated user.",
        body: AuthLoginResponseDto,
        cookies: ["voyzu_auth"],
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
  "auth.auth.logout": {
    description: "Clears the authenticated UI session cookie.",
    method: "DELETE",
    path: "/auth/session",
    loadHandler: () => import("./server/auth.http.handlers").then((module) => module.handleLogout),
    summary: "Log out",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The session has been cleared.",
        body: AuthSessionResponseDto,
        cookies: ["voyzu_auth"],
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.auth.me": {
    description: "Returns the current UI authentication session state.",
    method: "GET",
    path: "/auth/session",
    loadHandler: () => import("./server/auth.http.handlers").then((module) => module.handleMe),
    summary: "Get current session",
    
    
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
} as const;
