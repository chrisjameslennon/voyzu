import type { InternalApiInvoker } from "@voyzu/types/internal-api";
import type { Organization } from "../contracts/organization.definition";
import type { OrganizationFinance } from "../contracts/organization-finance.definition";
import type { Country } from "@voyzu/types/business-objects/country";
import type { CountryFinance } from "../contracts/country-finance.definition";

export function createOrganizationWithFinanceMethods(api: InternalApiInvoker) {
  return {
    async get(input: { organization_id: number }) {
      const [organization, finance] = await Promise.all([
        api.call("@core/organization", "get", input) as Promise<Organization | null>,
        api.call("@erp/organization-finance", "get", input) as Promise<OrganizationFinance | null>,
      ]);
      return organization && finance ? { ...organization, finance } : null;
    },
    async findByCode(input: { code: string }) {
      // Missing contributors are errors even when the base record is absent.
      if (!api.has("@erp/organization-finance")) throw new Error("No implementation for @erp/organization-finance");
      const organization = await api.call("@core/organization", "findByCode", input) as Organization | null;
      if (!organization) return null;
      const finance = await api.call("@erp/organization-finance", "get", { organization_id: organization.organization_id }) as OrganizationFinance | null;
      return finance ? { ...organization, finance } : null;
    },
  };
}
export function createCountryWithFinanceMethods(api: InternalApiInvoker) {
  return {
    async get(input: { code: string }) {
      const [country, finance] = await Promise.all([
        api.call("@core/country", "get", input) as Promise<Country | null>,
        api.call("@erp/country-finance", "get", input) as Promise<CountryFinance | null>,
      ]);
      return country && finance ? { ...country, finance } : null;
    },
  };
}
