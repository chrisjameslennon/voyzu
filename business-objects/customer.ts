import Type, { type Static } from "typebox";
import { PartySchema, type Party } from "./party";

export const CustomerAccountSchema = Type.Object({
  partyId: Type.Number(),
  creditLimit: Type.Number(),
}, { additionalProperties: false });

export interface CustomerAccount extends Static<typeof CustomerAccountSchema> {
  adjustCreditLimit(amount: number): Promise<void>;
}

export interface Customer {
  party: Party;
  account: CustomerAccount;
}