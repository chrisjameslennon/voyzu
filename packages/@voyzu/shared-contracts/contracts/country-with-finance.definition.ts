import { CountryWithFinanceSchema, CountryWithFinanceGetRequestDto, CountryWithFinanceGetResponseDto } from "../types/country-with-finance.internal-api.dto";
export { CountryWithFinanceSchema } from "../types/country-with-finance.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/country-with-finance. Definition registered by the owning package. */

export interface CountryWithFinance extends Static<typeof CountryWithFinanceSchema> {}

export const CountryWithFinanceDefinition = {
  dataDefinition: CountryWithFinanceSchema,
  methods: {
    get: { input: CountryWithFinanceGetRequestDto, output: CountryWithFinanceGetResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type CountryWithFinanceContract = typeof CountryWithFinanceDefinition;
export interface CountryWithFinanceMethods {
  get(parameters: Static<typeof CountryWithFinanceDefinition.methods.get.input>): Promise<Static<typeof CountryWithFinanceDefinition.methods.get.output>>;
}
