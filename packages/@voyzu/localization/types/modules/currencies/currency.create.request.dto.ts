import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode, NonBlankText } from "@voyzu/localization/types/constraints";

export const CurrencyCreateRequestDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  symbol: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type CurrencyCreateRequestDto = Type.Static<typeof CurrencyCreateRequestDto>;
