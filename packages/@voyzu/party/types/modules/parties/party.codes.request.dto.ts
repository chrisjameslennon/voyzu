import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";

export const PartyCodesRequestDto = StrictObject({
  codes: Type.Array(Type.String()),
});
export type PartyCodesRequestDto = Type.Static<typeof PartyCodesRequestDto>;
