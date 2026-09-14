import { CountrySchema, CountryGetRequestDto, CountryGetResponseDto } from "@voyzu/types/dtos/country";
export { CountrySchema } from "@voyzu/types/dtos/country";
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
  },
} as const satisfies InternalApiDefinition;

export type CountryContract = typeof CountryDefinition;
export interface CountryMethods {
  get(parameters: Static<typeof CountryDefinition.methods.get.input>): Promise<Static<typeof CountryDefinition.methods.get.output>>;
}
