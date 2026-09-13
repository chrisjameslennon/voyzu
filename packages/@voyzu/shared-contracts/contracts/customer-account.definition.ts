import { CustomerAccountSchema, CustomerAccountGetRequestDto, CustomerAccountGetResponseDto, CustomerAccountUpdateRequestDto, CustomerAccountUpdateResponseDto, CustomerAccountAdjustCreditLimitRequestDto, CustomerAccountAdjustCreditLimitResponseDto } from "../types/customer-account.internal-api.dto";
export { CustomerAccountSchema } from "../types/customer-account.internal-api.dto";
import type { Static } from "typebox";

export interface CustomerAccount extends Static<typeof CustomerAccountSchema> {}

export interface CustomerAccountMethods {
  get(parameters: { party_id: number }): Promise<CustomerAccount | null>;
  update(parameters: {
    party_id: number;
    changes: Partial<Pick<CustomerAccount, "purchaseOrderRequired">>;
  }): Promise<void>;
  adjustCreditLimit(parameters: { party_id: number; amount: number }): Promise<void>;
}

export const CustomerAccountDefinition = {
  dataDefinition: CustomerAccountSchema,
  methods: {
    get: {
      input: CustomerAccountGetRequestDto,
      output: CustomerAccountGetResponseDto,
    },
    update: {
      input: CustomerAccountUpdateRequestDto,
      output: CustomerAccountUpdateResponseDto,
    },
    adjustCreditLimit: {
      input: CustomerAccountAdjustCreditLimitRequestDto,
      output: CustomerAccountAdjustCreditLimitResponseDto,
    },
  },
} as const;

/** The complete schema definition, including data and method contracts. */
export type CustomerAccountContract = typeof CustomerAccountDefinition;
