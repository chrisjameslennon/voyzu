import type { OrganizationContextMethods } from "@voyzu/types/business-objects/organization-context";
import * as provider from "./organization-context.provider";
import { toInternalOrganization } from "../../organizations/server/lib/organization.implementation";

export const organizationContextMethods = {
  async getSavedOrganizationId() { return { organization_id: (await provider.getSavedOrganizationId({})).organizationId }; },
  async getAvailableOrganizations() { return { organizations: (await provider.getAvailableOrganizations({})).organizations.map(toInternalOrganization) }; },
  async getActiveOrganization() {
    const { selectedOrganization } = await provider.getActiveOrganization({});
    return { selectedOrganization: selectedOrganization ? toInternalOrganization(selectedOrganization) : null };
  },
  async setActiveOrganization({ organization_id }) { await provider.setActiveOrganization({ organizationId: organization_id }); return { organization_id }; },
} satisfies OrganizationContextMethods;
