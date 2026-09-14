import type { OrganizationContextMethods } from "@voyzu/types/business-objects/organization-context";
import { resolveOrganizationSelectionForCurrentUser } from "./organization-selection.service";
import * as provider from "./organization-context.provider";
import { toInternalOrganization } from "../../organizations/server/lib/organization.implementation";

export const organizationContextMethods = {
  async get() {
    const { organizationId } = await provider.getSavedOrganizationId({});
    const { organizations, selectedOrganization } = await resolveOrganizationSelectionForCurrentUser(organizationId);
    return { organization_id: organizationId, organizations: organizations.map(toInternalOrganization), selectedOrganization: selectedOrganization ? toInternalOrganization(selectedOrganization) : null };
  },
  async setActiveOrganization({ organization_id }) { await provider.setActiveOrganization({ organizationId: organization_id }); return { organization_id }; },
} satisfies OrganizationContextMethods;
