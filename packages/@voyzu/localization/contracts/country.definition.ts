import { CountrySchema, CountryGetRequestDto, CountryGetResponseDto, CountryListRequestDto, CountryListResponseDto } from "../types/country.internal-api.dto";
export { CountrySchema } from "../types/country.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/country. Definition registered by the owning package. Country code identifies retrieval; Finance data is a separate contribution. */

export interface Country extends Static<typeof CountrySchema> {}

export const CountryDefinition = {
  dataDefinition: CountrySchema,
  methods: {
    get: {
      input: CountryGetRequestDto,
      output: CountryGetResponseDto,
    },
    list: {
      input: CountryListRequestDto,
      output: CountryListResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type CountryContract = typeof CountryDefinition;
export interface CountryMethods {
  get(parameters: Static<typeof CountryDefinition.methods.get.input>): Promise<Static<typeof CountryDefinition.methods.get.output>>;
  list(parameters: Static<typeof CountryDefinition.methods.list.input>): Promise<Static<typeof CountryDefinition.methods.list.output>>;
}
