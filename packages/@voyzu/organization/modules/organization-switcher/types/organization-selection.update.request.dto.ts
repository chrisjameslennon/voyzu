import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { PositiveId } from "@voyzu/organization/types/constraints";

export const OrganizationSelectionUpdateRequestDto = StrictObject({
  organizationId: PositiveId,
});
export type OrganizationSelectionUpdateRequestDto = Type.Static<typeof OrganizationSelectionUpdateRequestDto>;
