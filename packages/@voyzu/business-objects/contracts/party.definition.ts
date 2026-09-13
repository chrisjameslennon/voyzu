import { PartySchema, PartyGetRequestDto, PartyGetResponseDto, PartyFindByCodeRequestDto, PartyFindByCodeResponseDto, PartyUpdateRequestDto, PartyUpdateResponseDto } from "../types/party.internal-api.dto";
export { PartySchema } from "../types/party.internal-api.dto";
import type { Static } from "typebox";

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
      input: PartyGetRequestDto,
      output: PartyGetResponseDto,
    },
    findByCode: {
      input: PartyFindByCodeRequestDto,
      output: PartyFindByCodeResponseDto,
    },
    update: {
      input: PartyUpdateRequestDto,
      output: PartyUpdateResponseDto,
    },
  },
} as const;

/** The complete schema definition, including data and method contracts. */
export type PartyContract = typeof PartyDefinition;
