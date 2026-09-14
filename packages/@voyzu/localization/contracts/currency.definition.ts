import { CurrencySchema, CurrencyGetRequestDto, CurrencyGetResponseDto } from "../types/currency.internal-api.dto";
export { CurrencySchema } from "../types/currency.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/currency. Definition registered by the owning package.  */

export interface Currency extends Static<typeof CurrencySchema> {}

export const CurrencyDefinition = {
  dataDefinition: CurrencySchema,
  methods: {
    get: {
      input: CurrencyGetRequestDto,
      output: CurrencyGetResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type CurrencyContract = typeof CurrencyDefinition;
export interface CurrencyMethods {
  get(parameters: Static<typeof CurrencyDefinition.methods.get.input>): Promise<Static<typeof CurrencyDefinition.methods.get.output>>;
}
