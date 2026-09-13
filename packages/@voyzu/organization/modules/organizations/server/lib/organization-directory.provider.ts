import { getDb } from "@voyzu/capability/db";
import { OrganizationRepo } from "../db/organization.repo";

// Internal label directory, not the current user's selectable-organization list.
// Callers retain authorization for their own use (for example, Audit's admin routes).
export async function list() {
  return { organizations: await new OrganizationRepo(getDb()).listDirectory() };
}
