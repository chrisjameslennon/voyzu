import { OrganizationWithFinanceSchema, OrganizationWithFinanceFindByCodeRequestDto, OrganizationWithFinanceGetRequestDto, OrganizationWithFinanceGetResponseDto, OrganizationWithFinanceFindByCodeResponseDto } from "../types/organization-with-finance.internal-api.dto";
export { OrganizationWithFinanceSchema } from "../types/organization-with-finance.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/organization-with-finance. Definition registered by the owning package. */

export interface OrganizationWithFinance extends Static<typeof OrganizationWithFinanceSchema> {}

export const OrganizationWithFinanceDefinition = {
  dataDefinition: OrganizationWithFinanceSchema,
  methods: {
    get: { input: OrganizationWithFinanceGetRequestDto, output: OrganizationWithFinanceGetResponseDto },
    findByCode: { input: OrganizationWithFinanceFindByCodeRequestDto, output: OrganizationWithFinanceFindByCodeResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type OrganizationWithFinanceContract = typeof OrganizationWithFinanceDefinition;
export interface OrganizationWithFinanceMethods {
  get(parameters: Static<typeof OrganizationWithFinanceDefinition.methods.get.input>): Promise<Static<typeof OrganizationWithFinanceDefinition.methods.get.output>>;
  findByCode(parameters: Static<typeof OrganizationWithFinanceDefinition.methods.findByCode.input>): Promise<Static<typeof OrganizationWithFinanceDefinition.methods.findByCode.output>>;
}
