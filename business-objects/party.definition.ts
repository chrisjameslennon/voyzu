import Type, { type Static } from "typebox";

export const PartySchema = Type.Object(
  {
    party_id: Type.Number(),
    code: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false },
);

export interface Party extends Static<typeof PartySchema> {}

export interface PartyMethods {
  get(parameters: { party_id: number }): Promise<Party | null>;
  findByCode(parameters: { code: string }): Promise<Party | null>;
  update(parameters: {
    party_id: number;
    changes: Partial<Pick<Party, "code" | "name">>;
  }): Promise<void>;
}

export const PartyDefinition = {
  dataDefinition: PartySchema,
  methods: {
    get: {
      input: Type.Object({ party_id: Type.Number() }, { additionalProperties: false }),
      output: Type.Union([PartySchema, Type.Null()]),
    },
    findByCode: {
      input: Type.Object({ code: Type.String() }, { additionalProperties: false }),
      output: Type.Union([PartySchema, Type.Null()]),
    },
    update: {
      input: Type.Object({
        party_id: Type.Number(),
        changes: Type.Object({ code: Type.Optional(Type.String()), name: Type.Optional(Type.String()) }, { additionalProperties: false }),
      }, { additionalProperties: false }),
      output: Type.Undefined(),
    },
  },
} as const;

/** The complete schema definition, including data and method contracts. */
export type PartyContract = typeof PartyDefinition;
