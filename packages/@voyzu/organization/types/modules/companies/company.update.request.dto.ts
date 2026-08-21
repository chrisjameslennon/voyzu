import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode14, CountryCode, CurrencyCode, NonBlankText, TaxFilingAnchorMonth } from "@voyzu/organization/types/constraints";

export const CompanyUpdateRequestDto = StrictObject({
  code: BusinessCode14,
  name: NonBlankText,
  countryCode: CountryCode,
  baseCurrencyCode: CurrencyCode,
  taxFilingAnchorMonth: Type.Optional(TaxFilingAnchorMonth),
  taxFilingIntervalMonths: Type.Optional(Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)])),
  useOrganizationStandardSettings: Type.Optional(Type.Boolean()),
  reportLine1: Type.Optional(Type.String()),
  reportLine2: Type.Optional(Type.String()),
  reportFooter: Type.Optional(Type.String()),
});
export type CompanyUpdateRequestDto = Type.Static<typeof CompanyUpdateRequestDto>;
