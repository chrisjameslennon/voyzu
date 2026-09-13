import Type from "typebox";

export const CustomerAccountSchema = Type.Object(
  {
    party_id: Type.Number(),
    creditLimit: Type.Number(),
    purchaseOrderRequired: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const CustomerAccountGetRequestDto = Type.Object({ party_id: Type.Number() }, { additionalProperties: false });

export const CustomerAccountGetResponseDto = Type.Union([CustomerAccountSchema, Type.Null()]);

export const CustomerAccountUpdateRequestDto = Type.Object({
        party_id: Type.Number(),
        changes: Type.Object({ purchaseOrderRequired: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      }, { additionalProperties: false });

export const CustomerAccountUpdateResponseDto = Type.Undefined();

export const CustomerAccountAdjustCreditLimitRequestDto = Type.Object({ party_id: Type.Number(), amount: Type.Number() }, { additionalProperties: false });

export const CustomerAccountAdjustCreditLimitResponseDto = Type.Undefined();
