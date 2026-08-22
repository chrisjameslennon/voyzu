import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode, CurrencyCode, NonBlankText } from "@voyzu/localization/types/constraints";

export const CountryCreateRequestDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  currencyCode: CurrencyCode,
});
export type CountryCreateRequestDto = Type.Static<typeof CountryCreateRequestDto>;
