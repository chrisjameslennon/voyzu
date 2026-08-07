import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  verifyAuthSessionToken,
} from "@voyzu/auth/auth/server/session";

const PUBLIC_FILE = /\.(.*)$/;

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/voyzu/") ||
    PUBLIC_FILE.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await verifyAuthSessionToken(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
