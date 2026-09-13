import { internalApi } from "@voyzu/capability/internal-api";
export async function listAuditOrganizations() {
  return (await internalApi.call("@core/organization", "getDirectory", {})).map(({ organization_id, ...record }) => ({ id: organization_id, ...record }));
}
