import { getDb } from "@voyzu/capability/db";
export async function listAuditOrganizations() {
  const { rows } = await getDb().query("SELECT id, code, name FROM organization WHERE status != 'DELETED' ORDER BY code");
  return rows.map(row => ({ id: Number(row.id), code: String(row.code), name: String(row.name) }));
}
