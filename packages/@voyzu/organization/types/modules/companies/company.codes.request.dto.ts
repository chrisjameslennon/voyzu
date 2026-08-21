import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const CompanyCodesRequestDto = StrictObject({
  codes: Type.Array(Type.String()),
});
export type CompanyCodesRequestDto = Type.Static<typeof CompanyCodesRequestDto>;
