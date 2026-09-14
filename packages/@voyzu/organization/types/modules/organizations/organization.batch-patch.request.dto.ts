import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { OrganizationPatchRequestDto } from "./organization.patch.request.dto";
import { BusinessCode14 } from "@voyzu/organization/types/constraints";

export const OrganizationBatchPatchRequestDto = StrictObject({
  ...OrganizationPatchRequestDto.properties,
  code: BusinessCode14,
});
export type OrganizationBatchPatchRequestDto = Type.Static<typeof OrganizationBatchPatchRequestDto>;
