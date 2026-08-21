import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CompanyPatchRequestDto } from "./company.patch.request.dto";
import { BusinessCode14 } from "@voyzu/organization/types/constraints";

export const CompanyBatchPatchRequestDto = StrictObject({
  ...CompanyPatchRequestDto.properties,
  code: BusinessCode14,
});
export type CompanyBatchPatchRequestDto = Type.Static<typeof CompanyBatchPatchRequestDto>;
