import Type from "typebox";
import { StrictObject } from "../../../../lib/types/src/http-api";

export const Status = Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]);

export const CountryTaxAuthorityResponseDto = StrictObject({
  id: Type.String(),
  code: Type.String(),
  name: Type.String(),
  regionCode: Type.Union([Type.String(), Type.Null()]),
  jurisdictionLevel: Type.String(),
  status: Status,
});

export const CountryTaxRuleResponseDto = StrictObject({
  id: Type.String(),
  code: Type.String(),
  name: Type.String(),
  regionCode: Type.Union([Type.String(), Type.Null()]),
  invoiceLabel: Type.String(),
  calculationMethod: Type.String(),
  componentCount: Type.Integer({ minimum: 0 }),
  status: Status,
});

export const CountryTaxComponentResponseDto = StrictObject({
  id: Type.String(),
  code: Type.String(),
  taxRuleCode: Type.String(),
  taxAuthorityCode: Type.String(),
  schemeCode: Type.String(),
  invoiceLabel: Type.String(),
  rate: Type.Number(),
  status: Status,
});

export const FinanceFields = StrictObject({
  financialPeriodStartMonth: Type.Union([Type.String(), Type.Null()]),
  taxFilingAnchorMonth: Type.Integer({ minimum: 1, maximum: 12 }),
  taxFilingIntervalMonths: Type.Union([
    Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12),
  ]),
  taxAuthorities: Type.Array(CountryTaxAuthorityResponseDto),
  taxRules: Type.Array(CountryTaxRuleResponseDto),
  taxComponents: Type.Array(CountryTaxComponentResponseDto),
});

export const CountryFinanceSchema = Type.Object({ code: Type.String({ pattern: "^[A-Z]{2}$" }), ...FinanceFields.properties }, { additionalProperties: false });

export const CountryFinanceGetRequestDto = Type.Object({ code: Type.String({ pattern: "^[A-Z]{2}$" }) }, { additionalProperties: false });

export const CountryFinanceGetResponseDto = Type.Union([CountryFinanceSchema, Type.Null()]);
