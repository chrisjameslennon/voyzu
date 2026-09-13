import Type from "typebox";

export const PartySchema = Type.Object(
  {
    party_id: Type.Number(),
    code: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false },
);

export const PartyGetRequestDto = Type.Object({ party_id: Type.Number() }, { additionalProperties: false });

export const PartyGetResponseDto = Type.Union([PartySchema, Type.Null()]);

export const PartyFindByCodeRequestDto = Type.Object({ code: Type.String() }, { additionalProperties: false });

export const PartyFindByCodeResponseDto = Type.Union([PartySchema, Type.Null()]);

export const PartyUpdateRequestDto = Type.Object({
        party_id: Type.Number(),
        changes: Type.Object({ code: Type.Optional(Type.String()), name: Type.Optional(Type.String()) }, { additionalProperties: false }),
      }, { additionalProperties: false });

export const PartyUpdateResponseDto = Type.Undefined();
