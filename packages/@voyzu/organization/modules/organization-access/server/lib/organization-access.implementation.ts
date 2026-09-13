import type { OrganizationAccessMethods } from "@voyzu/types/business-objects/organization-access";
import { NotFoundError } from "@voyzu/capability/errors";
import { listOrganizationAccess, replaceUserOrganizationAccess } from "./organization-access.service";

export const organizationAccessMethods = {
  async get({ userId }) {
    const user = (await listOrganizationAccess()).users.find(user => user.userId === userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);
    return { userId, organization_ids: user.organizationIds };
  },
  async replace({ userCode, organization_ids }) {
    const user = await replaceUserOrganizationAccess(userCode, organization_ids);
    return { userId: user.userId, organization_ids: user.organizationIds };
  },
} satisfies OrganizationAccessMethods;
