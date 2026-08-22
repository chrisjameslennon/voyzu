import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CurrencyCode, NonBlankText } from "@voyzu/localization/types/constraints";

export const CountryUpdateRequestDto = StrictObject({
  name: NonBlankText,
  currencyCode: CurrencyCode,
});
export type CountryUpdateRequestDto = Type.Static<typeof CountryUpdateRequestDto>;
