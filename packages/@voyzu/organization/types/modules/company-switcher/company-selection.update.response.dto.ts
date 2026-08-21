import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { PositiveId } from "@voyzu/organization/types/constraints";

export const CompanySelectionUpdateResponseDto = StrictObject({
  selectedCompanyId: PositiveId,
});
export type CompanySelectionUpdateResponseDto = Type.Static<typeof CompanySelectionUpdateResponseDto>;
