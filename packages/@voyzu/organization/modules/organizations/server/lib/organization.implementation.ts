import type { OrganizationMethods, Organization } from "@voyzu/types/business-objects/organization";
import { NotFoundError } from "@voyzu/capability/errors";
import * as service from "./organization.service";

export function toInternalOrganization({ id, ...record }: Awaited<ReturnType<typeof service.createOrganization>>): Organization {
  return { ...record, organization_id: id };
}
async function byId(id: number) {
  const record = await service.getOrganizationById(id);
  if (!record) throw new NotFoundError(`Organization ${id} not found`);
  return record;
}
export const organizationMethods = {
  async get(input) { const record = await ("organization_id" in input ? service.getOrganizationById(input.organization_id) : service.getOrganization(input.code)); return record ? toInternalOrganization(record) : null; },
  async create(input) { return toInternalOrganization(await service.createOrganization(input)); },
  async update({ organization_id, changes }) { return toInternalOrganization(await service.patchOrganization((await byId(organization_id)).code, changes)); },
  async activate({ organization_id }) { return toInternalOrganization(await service.activateOrganization((await byId(organization_id)).code)); },
  async deactivate({ organization_id }) { return toInternalOrganization(await service.deactivateOrganization((await byId(organization_id)).code)); },
  async delete({ organization_id }) { await service.deleteOrganization((await byId(organization_id)).code); },
} satisfies OrganizationMethods;
