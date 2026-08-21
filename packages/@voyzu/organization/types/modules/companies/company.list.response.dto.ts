import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CompanyResponseDto } from "./company.response.dto";

export const CompanyListResponseDto = StrictObject({
  items: Type.Array(CompanyResponseDto),
  totalMatching: Type.Number(),
});
export type CompanyListResponseDto = Type.Static<typeof CompanyListResponseDto>;
