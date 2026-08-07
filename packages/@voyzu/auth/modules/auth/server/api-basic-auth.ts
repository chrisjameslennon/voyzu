import { Buffer } from "node:buffer";

import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@voyzu/capability/db";
import type { UserResponseDto } from "@voyzu/auth/types";
import { UserRepo } from "../../users/server/db/user.repo";
import { runWithCurrentUserContext } from "../../users/server/lib/current-user-context";
import { verifyPassword } from "../../users/server/lib/password-hash";
import { toDto } from "../../users/server/lib/user.mapper";

export type ApiBasicAuthResult =
  | { kind: "none" }
  | { kind: "authenticated"; user: UserResponseDto }
  | { kind: "response"; response: NextResponse };

function unauthorized(message = "Invalid API credentials"): NextResponse {
  return NextResponse.json(
    {
      code: "UNAUTHORIZED",
      message,
    },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Voyzu API"',
      },
    },
  );
}

function forbidden(message = "User is not enabled for API access"): NextResponse {
  return NextResponse.json(
    {
      code: "FORBIDDEN",
      message,
    },
    { status: 403 },
  );
}

function decodeBasicCredentials(value: string): { code: string; password: string } | null {
  const [scheme, encoded] = value.split(" ");
  if (scheme !== "Basic" || !encoded) return null;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex <= 0) return null;
    return {
      code: decoded.slice(0, separatorIndex).trim(),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export async function authenticateApiBasicRequest(request: NextRequest): Promise<ApiBasicAuthResult> {
  const header = request.headers.get("authorization");
  if (!header) return { kind: "none" };
  if (!header.startsWith("Basic ")) return { kind: "response", response: unauthorized("Unsupported authorization scheme") };

  const credentials = decodeBasicCredentials(header);
  if (!credentials?.code || !credentials.password) {
    return { kind: "response", response: unauthorized() };
  }

  const repo = new UserRepo(getDb());
  const row = await repo.get(credentials.code.toUpperCase());
  if (!row || row.status !== "ACTIVE" || !(await verifyPassword(credentials.password, row.password_hash))) {
    return { kind: "response", response: unauthorized() };
  }

  if (row.access_mode !== "API" && row.access_mode !== "UI_AND_API") {
    return { kind: "response", response: forbidden() };
  }

  return {
    kind: "authenticated",
    user: toDto(row, await repo.listAssignments(row.id)),
  };
}

export async function withApiBasicAuthContext<T>(
  request: NextRequest,
  callback: () => Promise<T>,
): Promise<T | NextResponse> {
  const auth = await authenticateApiBasicRequest(request);
  if (auth.kind === "none") return callback();
  if (auth.kind === "response") return auth.response;
  return runWithCurrentUserContext(auth.user, callback, "API");
}
