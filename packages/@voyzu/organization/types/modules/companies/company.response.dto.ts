import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, Status } from "@voyzu/organization/types/modules/core";
import { BusinessCode, CountryCode, CurrencyCode, NonBlankText, PositiveId } from "@voyzu/organization/types/constraints";

export const CompanyResponseDto = StrictObject({
  id: PositiveId,
  code: BusinessCode,
  name: NonBlankText,
  countryCode: CountryCode,
  country: Type.Optional(StrictObject({
    code: BusinessCode,
    name: NonBlankText,
  })),
  baseCurrencyCode: CurrencyCode,
  baseCurrency: Type.Optional(StrictObject({
    code: BusinessCode,
    name: NonBlankText,
  })),
  taxFilingAnchorMonth: Type.Number({ description: "Tax filing anchor month." }),
  taxFilingIntervalMonths: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)]),
  useOrganizationStandardSettings: Type.Boolean({ description: "Whether this company inherits organization standard settings." }),
  reportLine1: Type.Optional(Type.String()),
  reportLine2: Type.Optional(Type.String()),
  reportFooter: Type.Optional(Type.String()),
  status: Status,
  hasPostings: Type.Boolean({ description: "Whether the company has posted journal entries." }),
  audit: AuditMetadataDto,
});
export type CompanyResponseDto = Type.Static<typeof CompanyResponseDto>;
