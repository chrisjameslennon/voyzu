import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CurrencyCode, NonBlankText, TaxFilingAnchorMonth } from "@voyzu/organization/types/constraints";

export const CountryPatchRequestDto = StrictObject({
  name: Type.Optional(NonBlankText),
  currencyCode: Type.Optional(CurrencyCode),
  taxFilingAnchorMonth: Type.Optional(TaxFilingAnchorMonth),
  taxFilingIntervalMonths: Type.Optional(Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)])),
}, { minProperties: 1 });
export type CountryPatchRequestDto = Type.Static<typeof CountryPatchRequestDto>;
