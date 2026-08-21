import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, OperationReference } from "@voyzu/organization/types/modules/core";
import { Status } from "@voyzu/organization/types/modules/core";
import { BusinessCode, CurrencyCode, NonBlankText } from "@voyzu/organization/types/constraints";

export const CountryTaxAuthorityResponseDto = StrictObject({
  id: Type.String({ description: "Internal identifier for the tax authority." }),
  code: BusinessCode,
  name: NonBlankText,
  regionCode: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  jurisdictionLevel: Type.String({ description: "Jurisdiction level handled by the authority." }),
  status: Status,
});
export type CountryTaxAuthorityResponseDto = Type.Static<typeof CountryTaxAuthorityResponseDto>;

export const CountryTaxRuleResponseDto = StrictObject({
  id: Type.String({ description: "Internal identifier for the tax rule." }),
  code: BusinessCode,
  name: NonBlankText,
  regionCode: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  invoiceLabel: Type.String({ description: "Invoice label used for this tax rule." }),
  calculationMethod: Type.String({ description: "Calculation method used by this tax rule." }),
  componentCount: Type.Number({ description: "Number of tax components in this tax rule." }),
  status: Status,
});
export type CountryTaxRuleResponseDto = Type.Static<typeof CountryTaxRuleResponseDto>;

export const CountryTaxComponentResponseDto = StrictObject({
  id: Type.String({ description: "Internal identifier for the tax component." }),
  code: BusinessCode,
  taxRuleCode: BusinessCode,
  taxAuthorityCode: BusinessCode,
  schemeCode: BusinessCode,
  invoiceLabel: Type.String({ description: "Invoice label used for this tax component." }),
  rate: Type.Number({ description: "Tax rate for this component." }),
  status: Status,
});
export type CountryTaxComponentResponseDto = Type.Static<typeof CountryTaxComponentResponseDto>;

export const CountryResponseDto = StrictObject({
  id: Type.String({ description: "Stable country identifier." }),
  code: BusinessCode,
  name: NonBlankText,
  currencyCode: CurrencyCode,
  financialPeriodStartMonth: Type.Union([Type.String(), Type.Null()]),
  taxFilingAnchorMonth: Type.Number({ description: "Anchor month used for tax filing cycles." }),
  taxFilingIntervalMonths: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)]),
  taxAuthorities: Type.Optional(Type.Array(CountryTaxAuthorityResponseDto)),
  taxRules: Type.Optional(Type.Array(CountryTaxRuleResponseDto)),
  taxComponents: Type.Optional(Type.Array(CountryTaxComponentResponseDto)),
  currency: StrictObject({
    code: BusinessCode,
    name: NonBlankText,
  }),
  status: Status,
  hasPostings: Type.Boolean({ description: "True when at least one company in this country has posted journal headers." }),
  linkedBy: Type.Array(OperationReference),
  audit: AuditMetadataDto,
});
export type CountryResponseDto = Type.Static<typeof CountryResponseDto>;
