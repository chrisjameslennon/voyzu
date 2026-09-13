import Type, { type Static } from "typebox";
import { PartySchema, type Party } from "./party";

export const CustomerSchema = Type.Object({
  ...PartySchema.properties,
  creditLimit: Type.Number(),
}, { additionalProperties: false });

export interface Customer extends Party, Static<typeof CustomerSchema> {
  get(id: number): Promise<Customer | null>;
  findByCode(code: string): Promise<Customer | null>;
}
