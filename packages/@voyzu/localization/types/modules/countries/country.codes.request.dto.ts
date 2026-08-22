import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const CountryCodesRequestDto = StrictObject({
  codes: Type.Array(Type.String()),
});
export type CountryCodesRequestDto = Type.Static<typeof CountryCodesRequestDto>;
