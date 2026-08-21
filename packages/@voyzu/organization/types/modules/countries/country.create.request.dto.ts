import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode, CurrencyCode, NonBlankText, TaxFilingAnchorMonth } from "@voyzu/organization/types/constraints";

export const CountryCreateRequestDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  currencyCode: CurrencyCode,
  taxFilingAnchorMonth: Type.Optional(TaxFilingAnchorMonth),
  taxFilingIntervalMonths: Type.Optional(Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)])),
});
export type CountryCreateRequestDto = Type.Static<typeof CountryCreateRequestDto>;
