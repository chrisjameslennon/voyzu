import Type, { type Static } from "typebox";

export const PartySchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
}, { additionalProperties: false });

// The schema describes data only; behaviour belongs to the interface.
export interface Party extends Static<typeof PartySchema> {
  get(id: number): Promise<Party | null>;
  findByCode(code: string): Promise<Party | null>;
}
