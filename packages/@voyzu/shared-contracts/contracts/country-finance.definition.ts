import { CountryTaxAuthorityResponseDto, CountryTaxRuleResponseDto, CountryTaxComponentResponseDto, CountryFinanceSchema, CountryFinanceGetRequestDto, CountryFinanceGetResponseDto } from "../types/country-finance.internal-api.dto";
export { CountryTaxAuthorityResponseDto, CountryTaxRuleResponseDto, CountryTaxComponentResponseDto, CountryFinanceSchema } from "../types/country-finance.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/country-finance. Definition registered by the owning package. */

export interface CountryFinance extends Static<typeof CountryFinanceSchema> {}

export const CountryFinanceDefinition = {
  dataDefinition: CountryFinanceSchema,
  methods: {
    get: { input: CountryFinanceGetRequestDto, output: CountryFinanceGetResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type CountryFinanceContract = typeof CountryFinanceDefinition;
export interface CountryFinanceMethods {
  get(parameters: Static<typeof CountryFinanceDefinition.methods.get.input>): Promise<Static<typeof CountryFinanceDefinition.methods.get.output>>;
}
