import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode14, CountryCode, CurrencyCode, NonBlankText } from "@voyzu/organization/types/constraints";

export const OrganizationPatchRequestDto = StrictObject({
  code: Type.Optional(BusinessCode14),
  name: Type.Optional(NonBlankText),
  countryCode: Type.Optional(CountryCode),
  baseCurrencyCode: Type.Optional(CurrencyCode),
}, { minProperties: 1 });
export type OrganizationPatchRequestDto = Type.Static<typeof OrganizationPatchRequestDto>;
