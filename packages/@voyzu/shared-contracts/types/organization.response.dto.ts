import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, Status } from "@voyzu/types/modules/core";
const BusinessCode = Type.String({ pattern: "^[A-Z0-9][A-Z0-9_-]*$" });
const CountryCode = Type.String({ pattern: "^[A-Z]{2}$" });
const CurrencyCode = Type.String({ pattern: "^[A-Z]{3}$" });
const NonBlankText = Type.String({ pattern: "\\S" });
const PositiveId = Type.Integer({ minimum: 1 });

export const OrganizationResponseDto = StrictObject({
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
  status: Status,
  audit: AuditMetadataDto,
});
export type OrganizationResponseDto = Type.Static<typeof OrganizationResponseDto>;
