import { PartySchema, PartyGetRequestDto, PartyGetResponseDto, PartyUpdateRequestDto, PartyUpdateResponseDto } from "@voyzu/types/dtos/party";
export { PartySchema } from "@voyzu/types/dtos/party";
import type { Static } from "typebox";

export interface Party extends Static<typeof PartySchema> {}

export interface PartyMethods {
  get(parameters: { party_id: number } | { code: string }): Promise<Party | null>;
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
    update: {
      input: PartyUpdateRequestDto,
      output: PartyUpdateResponseDto,
    },
  },
} as const;

/** The complete schema definition, including data and method contracts. */
export type PartyContract = typeof PartyDefinition;
