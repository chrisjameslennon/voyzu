import {
  AUTH_COOKIE_NAME,
  verifyAuthSessionToken,
} from "../../../auth/server/session";
import type { UserResponseDto } from "@voyzu/auth/types";
import { getDb } from "@voyzu/capability/db";
import { UserRepo } from "../db/user.repo";
import { toDto } from "./user.mapper";
import { getCurrentActorTypeFromContext, getCurrentUserFromContext } from "./current-user-context";
import type { ActorType } from "@voyzu/types/modules/core";

type NextHeadersModule = typeof import("next/headers");

export async function getCurrentUser(): Promise<UserResponseDto | null> {
  const contextUser = getCurrentUserFromContext();
  if (contextUser) return contextUser;

  let cookieStore: Awaited<ReturnType<NextHeadersModule["cookies"]>>;
  try {
    const { cookies } = await import("next/headers");
    cookieStore = await cookies();
  } catch (err) {
    if (
      err instanceof Error
      && (err.message.includes("outside a request scope")
        || err.message.includes("This module cannot be imported from a Client Component module"))
    ) return null;
    throw err;
  }
  const session = await verifyAuthSessionToken(
    cookieStore.get(AUTH_COOKIE_NAME)?.value,
  );
  if (!session) return null;

  const repo = new UserRepo(getDb());
  const row = await repo.get(session.code);
  return row ? toDto(row, await repo.listAssignments(row.id)) : null;
}

export async function currentUserCanManageUsers(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.status === "ACTIVE" && user.role === "ADMIN";
}

export function getCurrentActorType(): ActorType {
  return getCurrentActorTypeFromContext() ?? "APP";
}
