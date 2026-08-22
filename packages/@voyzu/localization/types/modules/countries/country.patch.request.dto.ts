import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CurrencyCode, NonBlankText } from "@voyzu/localization/types/constraints";

export const CountryPatchRequestDto = StrictObject({
  name: Type.Optional(NonBlankText),
  currencyCode: Type.Optional(CurrencyCode),
}, { minProperties: 1 });
export type CountryPatchRequestDto = Type.Static<typeof CountryPatchRequestDto>;
