import { getDb } from "@voyzu/capability/db";
import type { UserOrganizationAccessResponseDto } from "../../../../types/user-organization-access.dto";

export async function listUserOrganizationOptions(): Promise<UserOrganizationAccessResponseDto["organizations"]> {
  const { rows } = await getDb().query(
    "SELECT id, code, name, status FROM organization WHERE status IN ('ACTIVE', 'INACTIVE') ORDER BY code",
  );
  return rows.map((row) => ({
    id: Number(row.id),
    code: String(row.code),
    name: String(row.name),
    status: row.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
  }));
}
