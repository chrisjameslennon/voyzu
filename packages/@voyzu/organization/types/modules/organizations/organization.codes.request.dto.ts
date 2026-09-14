import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";

export const OrganizationCodesRequestDto = StrictObject({
  codes: Type.Array(Type.String()),
});
export type OrganizationCodesRequestDto = Type.Static<typeof OrganizationCodesRequestDto>;
