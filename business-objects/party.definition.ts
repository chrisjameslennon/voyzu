import Type, { type Static } from "typebox";

export const PartySchema = Type.Object(
  {
    id: Type.Number(),
    code: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false },
);

export interface Party extends Static<typeof PartySchema> {}
