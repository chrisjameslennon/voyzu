import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CompanyResponseDto } from "../companies";
import { PositiveId } from "@voyzu/organization/types/constraints";

export const CompanySelectionResponseDto = StrictObject({
  companies: Type.Array(CompanyResponseDto),
  selectedCompany: Type.Union([CompanyResponseDto, Type.Null()]),
  selectedCompanyId: Type.Union([PositiveId, Type.Null()]),
});
export type CompanySelectionResponseDto = Type.Static<typeof CompanySelectionResponseDto>;
