import { CurrencySchema, CurrencyGetRequestDto, CurrencyGetResponseDto, CurrencyListRequestDto, CurrencyListResponseDto } from "../types/currency.internal-api.dto";
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
    list: {
      input: CurrencyListRequestDto,
      output: CurrencyListResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type CurrencyContract = typeof CurrencyDefinition;
export interface CurrencyMethods {
  get(parameters: Static<typeof CurrencyDefinition.methods.get.input>): Promise<Static<typeof CurrencyDefinition.methods.get.output>>;
  list(parameters: Static<typeof CurrencyDefinition.methods.list.input>): Promise<Static<typeof CurrencyDefinition.methods.list.output>>;
}
