import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode14, CountryCode, CurrencyCode, NonBlankText } from "@voyzu/organization/types/constraints";

export const OrganizationUpdateRequestDto = StrictObject({
  code: BusinessCode14,
  name: NonBlankText,
  countryCode: CountryCode,
  baseCurrencyCode: CurrencyCode,
});
export type OrganizationUpdateRequestDto = Type.Static<typeof OrganizationUpdateRequestDto>;
