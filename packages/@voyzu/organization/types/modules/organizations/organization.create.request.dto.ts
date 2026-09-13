import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode14, CountryCode, CurrencyCode, NonBlankText } from "@voyzu/organization/types/constraints";

export const OrganizationCreateRequestDto = StrictObject({
  code: BusinessCode14,
  name: NonBlankText,
  countryCode: CountryCode,
  baseCurrencyCode: CurrencyCode,
});
export type OrganizationCreateRequestDto = Type.Static<typeof OrganizationCreateRequestDto>;
