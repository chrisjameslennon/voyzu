import { capabilities } from "@voyzu/capability/contracts";

export async function listAuditOrganizations() {
  const directory = capabilities.optional("platform.organization-directory");
  if (!directory) return [];
  const { organizations } = await directory.list({});
  return organizations;
}
