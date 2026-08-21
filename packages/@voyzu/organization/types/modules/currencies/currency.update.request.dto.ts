import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { NonBlankText } from "@voyzu/organization/types/constraints";

export const CurrencyUpdateRequestDto = StrictObject({
  name: NonBlankText,
  symbol: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type CurrencyUpdateRequestDto = Type.Static<typeof CurrencyUpdateRequestDto>;
