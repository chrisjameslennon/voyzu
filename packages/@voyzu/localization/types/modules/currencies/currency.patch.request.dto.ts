import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { NonBlankText } from "@voyzu/localization/types/constraints";

export const CurrencyPatchRequestDto = StrictObject({
  name: Type.Optional(NonBlankText),
  symbol: Type.Optional(Type.Union([Type.String(), Type.Null()])),
}, { minProperties: 1 });
export type CurrencyPatchRequestDto = Type.Static<typeof CurrencyPatchRequestDto>;
