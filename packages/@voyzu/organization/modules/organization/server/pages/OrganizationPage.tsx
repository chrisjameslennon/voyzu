import "server-only";

import { notFound } from "next/navigation";

import { OrganizationSettings } from "../../client/OrganizationSettings";
import { getOrganization } from "../lib/organization.service";

export default async function OrganizationPage() {
  const organization = await getOrganization();
  if (!organization) notFound();

  return <OrganizationSettings organization={organization} pageTitle="Organization" />;
}
