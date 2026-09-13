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

export interface PartyMethods {
  get(parameters: { id: number }): Promise<Party | null>;
  findByCode(parameters: { code: string }): Promise<Party | null>;
  update(parameters: {
    id: number;
    changes: Partial<Pick<Party, "code" | "name">>;
  }): Promise<void>;
}
