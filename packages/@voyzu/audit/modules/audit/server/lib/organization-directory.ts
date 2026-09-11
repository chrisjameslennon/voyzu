import { semanticData } from "@voyzu/capability/contracts";
export async function listAuditOrganizations() {
  return await semanticData.queryOptional("organizationDirectory", "all", {}) ?? [];
}
