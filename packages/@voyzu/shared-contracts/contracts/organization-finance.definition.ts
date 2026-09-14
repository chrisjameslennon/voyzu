import { OrganizationFinanceUpdateRequestDto, OrganizationFinanceUpdateResponseDto, OrganizationFinanceSchema, OrganizationFinanceGetRequestDto, OrganizationFinanceGetResponseDto, OrganizationFinanceCreateFinancialEntityRequestDto, OrganizationFinanceCreateFinancialEntityResponseDto } from "../types/organization-finance.internal-api.dto";
export { OrganizationFinanceSchema, OrganizationFinanceChangesDto, type OrganizationFinanceChanges } from "../types/organization-finance.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/organization-finance. Definition registered by the owning package. */

export interface OrganizationFinance extends Static<typeof OrganizationFinanceSchema> {}

export const OrganizationFinanceDefinition = {
  dataDefinition: OrganizationFinanceSchema,
  methods: {
    update: { input: OrganizationFinanceUpdateRequestDto, output: OrganizationFinanceUpdateResponseDto },
    get: { input: OrganizationFinanceGetRequestDto, output: OrganizationFinanceGetResponseDto },
    createFinancialEntity: { input: OrganizationFinanceCreateFinancialEntityRequestDto, output: OrganizationFinanceCreateFinancialEntityResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type OrganizationFinanceContract = typeof OrganizationFinanceDefinition;
export interface OrganizationFinanceMethods {
  update(parameters: Static<typeof OrganizationFinanceUpdateRequestDto>): Promise<Static<typeof OrganizationFinanceUpdateResponseDto>>;
  get(parameters: Static<typeof OrganizationFinanceDefinition.methods.get.input>): Promise<Static<typeof OrganizationFinanceDefinition.methods.get.output>>;
  createFinancialEntity(parameters: Static<typeof OrganizationFinanceDefinition.methods.createFinancialEntity.input>): Promise<Static<typeof OrganizationFinanceDefinition.methods.createFinancialEntity.output>>;
}
