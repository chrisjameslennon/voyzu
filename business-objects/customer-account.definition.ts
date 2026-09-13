import Type, { type Static } from "typebox";

export const CustomerAccountSchema = Type.Object(
  {
    party_id: Type.Number(),
    creditLimit: Type.Number(),
    purchaseOrderRequired: Type.Boolean(),
  },
  { additionalProperties: false },
);

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
      input: Type.Object({ party_id: Type.Number() }, { additionalProperties: false }),
      output: Type.Union([CustomerAccountSchema, Type.Null()]),
    },
    update: {
      input: Type.Object({
        party_id: Type.Number(),
        changes: Type.Object({ purchaseOrderRequired: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      }, { additionalProperties: false }),
      output: Type.Undefined(),
    },
    adjustCreditLimit: {
      input: Type.Object({ party_id: Type.Number(), amount: Type.Number() }, { additionalProperties: false }),
      output: Type.Undefined(),
    },
  },
} as const;

/** The complete schema definition, including data and method contracts. */
export type CustomerAccountContract = typeof CustomerAccountDefinition;
