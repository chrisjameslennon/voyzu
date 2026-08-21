import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode14, CountryCode, CurrencyCode, NonBlankText, TaxFilingAnchorMonth } from "@voyzu/organization/types/constraints";

export const CompanyPatchRequestDto = StrictObject({
  code: Type.Optional(BusinessCode14),
  name: Type.Optional(NonBlankText),
  countryCode: Type.Optional(CountryCode),
  baseCurrencyCode: Type.Optional(CurrencyCode),
  taxFilingAnchorMonth: Type.Optional(TaxFilingAnchorMonth),
  taxFilingIntervalMonths: Type.Optional(Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)])),
  useOrganizationStandardSettings: Type.Optional(Type.Boolean()),
  reportLine1: Type.Optional(Type.String()),
  reportLine2: Type.Optional(Type.String()),
  reportFooter: Type.Optional(Type.String()),
}, { minProperties: 1 });
export type CompanyPatchRequestDto = Type.Static<typeof CompanyPatchRequestDto>;
