import Type from "typebox";
import { PartyDefinition, PartySchema, type Party } from "./party.definition";
import { CustomerAccountSchema, type CustomerAccount } from "./customer-account.definition";

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
  get(parameters: { id: number }): Promise<Customer | null>;
  findByCode(parameters: { code: string }): Promise<Customer | null>;
  update(parameters: {
    id: number;
    changes: Partial<Pick<Party, "code" | "name">>;
  }): Promise<void>;
}

export const CustomerSchema = Type.Object({
  ...PartySchema.properties,
  account: CustomerAccountSchema,
}, { additionalProperties: false });

export const CustomerDefinition = {
  dataDefinition: CustomerSchema,
  methods: {
    get: { ...PartyDefinition.methods.get, output: Type.Union([CustomerSchema, Type.Null()]) },
    findByCode: { ...PartyDefinition.methods.findByCode, output: Type.Union([CustomerSchema, Type.Null()]) },
    update: PartyDefinition.methods.update,
  },
} as const;
