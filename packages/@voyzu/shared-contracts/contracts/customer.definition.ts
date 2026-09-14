import { CustomerSchema, CustomerGetRequestDto, CustomerFindByCodeRequestDto, CustomerGetResponseDto, CustomerFindByCodeResponseDto } from "../types/customer.internal-api.dto";
export { CustomerSchema } from "../types/customer.internal-api.dto";
import { PartyDefinition, type Party } from "@voyzu/types/business-objects/party";
import { type CustomerAccount } from "./customer-account.definition";

/**
 * The canonical composed Customer business object.
 *
 * The root customer identity is supplied by the Party provider.
 * Package-specific customer data is composed beneath properties such as
 * `account`.
 */
export interface Customer extends Party {
  account: CustomerAccount;
}

export interface CustomerMethods {
  get(parameters: { party_id: number }): Promise<Customer | null>;
  findByCode(parameters: { code: string }): Promise<Customer | null>;
  update(parameters: {
    party_id: number;
    changes: Partial<Pick<Party, "code" | "name">>;
  }): Promise<void>;
}

export const CustomerDefinition = {
  dataDefinition: CustomerSchema,
  methods: {
    get: { input: CustomerGetRequestDto, output: CustomerGetResponseDto },
    findByCode: { input: CustomerFindByCodeRequestDto, output: CustomerFindByCodeResponseDto },
    update: PartyDefinition.methods.update,
  },
} as const;

/** The complete schema definition, including data and method contracts. */
export type CustomerContract = typeof CustomerDefinition;
