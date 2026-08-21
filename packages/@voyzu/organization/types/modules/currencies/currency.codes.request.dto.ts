import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const CurrencyCodesRequestDto = StrictObject({
  codes: Type.Array(Type.String()),
});
export type CurrencyCodesRequestDto = Type.Static<typeof CurrencyCodesRequestDto>;
