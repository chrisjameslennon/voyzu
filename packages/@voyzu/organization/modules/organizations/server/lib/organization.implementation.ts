import type { OrganizationMethods, Organization } from "@voyzu/types/business-objects/organization";
import { NotFoundError } from "@voyzu/capability/errors";
import * as service from "./organization.service";
import { list as directory } from "./organization-directory.provider";

export function toInternalOrganization({ id, ...record }: Awaited<ReturnType<typeof service.createOrganization>>): Organization {
  return { ...record, organization_id: id };
}
async function byId(id: number) {
  const record = await service.getOrganizationById(id);
  if (!record) throw new NotFoundError(`Organization ${id} not found`);
  return record;
}
export const organizationMethods = {
  async get({ organization_id }) { const record = await service.getOrganizationById(organization_id); return record ? toInternalOrganization(record) : null; },
  async findByCode({ code }) { const record = await service.getOrganization(code); return record ? toInternalOrganization(record) : null; },
  async list() { return (await service.listOrganizations()).map(toInternalOrganization); },
  async search({ phrase }) { return (await service.searchOrganizations(phrase)).map(toInternalOrganization); },
  async getDirectory() { return (await directory()).organizations.map(({ id, ...record }) => ({ organization_id: id, ...record })); },
  async create(input) { return toInternalOrganization(await service.createOrganization(input)); },
  async update({ organization_id, changes }) { return toInternalOrganization(await service.patchOrganization((await byId(organization_id)).code, changes)); },
  async activate({ organization_id }) { return toInternalOrganization(await service.activateOrganization((await byId(organization_id)).code)); },
  async deactivate({ organization_id }) { return toInternalOrganization(await service.deactivateOrganization((await byId(organization_id)).code)); },
  async delete({ organization_id }) { await service.deleteOrganization((await byId(organization_id)).code); },
} satisfies OrganizationMethods;
