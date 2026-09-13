import "server-only";

import { OrganizationAccess } from "../../client/OrganizationAccess";
import { listOrganizationAccess } from "../lib/organization-access.service";

export async function OrganizationAccessPage() {
  return <OrganizationAccess initial={await listOrganizationAccess()} />;
}
