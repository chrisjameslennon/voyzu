import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { PositiveId } from "@voyzu/organization/types/constraints";

export const OrganizationSelectionUpdateResponseDto = StrictObject({
  selectedOrganizationId: PositiveId,
});
export type OrganizationSelectionUpdateResponseDto = Type.Static<typeof OrganizationSelectionUpdateResponseDto>;
