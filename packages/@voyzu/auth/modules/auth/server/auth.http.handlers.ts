import { NextResponse, type NextRequest } from "next/server";

import { ok, serverError, unauthorizedError } from "@voyzu/capability/http";
import { UnauthorizedError } from "@voyzu/capability/errors";
import type { AuthLoginRequestDto } from "@voyzu/auth/types";
import { authenticateUser } from "./auth.service";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createAuthSessionToken,
  verifyAuthSessionToken,
} from "./session";

function toSafeUser(user: { code: string; displayName: string; role: string }) {
  return {
    code: user.code,
    displayName: user.displayName,
    role: user.role,
  };
}

export async function handleLogin(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as AuthLoginRequestDto;
    const user = await authenticateUser(body.identifier, body.password);
    const token = await createAuthSessionToken({
      userId: user.id,
      code: user.code,
      displayName: user.displayName,
      role: user.role,
    });
    const response = ok({ user: toSafeUser(user) });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedError(error.message);
    return serverError(error);
  }
}

export async function handleLogout(): Promise<NextResponse> {
  const response = ok({ authenticated: false });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  return response;
}

export async function handleMe(request: NextRequest): Promise<NextResponse> {
  const session = await verifyAuthSessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (!session) return ok({ authenticated: false });
  return ok({
    authenticated: true,
    user: {
      code: session.code,
      displayName: session.displayName,
      role: session.role,
    },
  });
}
