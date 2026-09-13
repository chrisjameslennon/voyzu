import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { OrganizationUpdateRequestDto } from "./organization.update.request.dto";
import { BusinessCode14 } from "@voyzu/organization/types/constraints";

export const OrganizationBatchUpdateRequestDto = StrictObject({
  ...OrganizationUpdateRequestDto.properties,
  code: BusinessCode14,
});
export type OrganizationBatchUpdateRequestDto = Type.Static<typeof OrganizationBatchUpdateRequestDto>;
