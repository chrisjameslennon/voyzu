import "server-only";
import { getDb } from "@voyzu/capability/db";
import type { CurrentIdentity } from "@voyzu/types/identity";
import type { AuditUserDto } from "@voyzu/types/modules/core";
import { getCurrentActorType, getCurrentUser } from "./current-user.service";

export async function current(): Promise<CurrentIdentity> {
  const user = await getCurrentUser();
  return {
    user: user ? {
      id: user.id, code: user.code, displayName: user.displayName,
      role: user.role, status: user.status, accessMode: user.accessMode,
    } : null,
    actorType: getCurrentActorType(),
    permissions: user?.status === "ACTIVE" && user.role === "ADMIN" ? ["audit.view", "users.manage"] : [],
  };
}

export async function lookup({ ids }: { ids: number[] }): Promise<{ users: AuditUserDto[] }> {
  if (!ids.length) return { users: [] };
  // Internal identity enrichment, not a public user-directory endpoint.
  const { rows } = await getDb().query(
    "SELECT id, code, display_name FROM app_user WHERE id = ANY($1::int[])",
    [[...new Set(ids)]],
  );
  return { users: rows.map((row) => ({ id: Number(row.id), code: String(row.code), displayName: String(row.display_name) })) };
}
