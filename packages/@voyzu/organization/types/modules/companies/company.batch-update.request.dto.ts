import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CompanyUpdateRequestDto } from "./company.update.request.dto";
import { BusinessCode14 } from "@voyzu/organization/types/constraints";

export const CompanyBatchUpdateRequestDto = StrictObject({
  ...CompanyUpdateRequestDto.properties,
  code: BusinessCode14,
});
export type CompanyBatchUpdateRequestDto = Type.Static<typeof CompanyBatchUpdateRequestDto>;
