import Type, { type Static } from "typebox";

export const CustomerAccountSchema = Type.Object(
  {
    creditLimit: Type.Number(),
    purchaseOrderRequired: Type.Boolean(),
  },
  { additionalProperties: false },
);

export interface CustomerAccount extends Static<typeof CustomerAccountSchema> {}

export interface CustomerAccountMethods {
  get(parameters: { id: number }): Promise<CustomerAccount | null>;
  update(parameters: {
    id: number;
    changes: Partial<Pick<CustomerAccount, "purchaseOrderRequired">>;
  }): Promise<void>;
  adjustCreditLimit(parameters: { id: number; amount: number }): Promise<void>;
}
