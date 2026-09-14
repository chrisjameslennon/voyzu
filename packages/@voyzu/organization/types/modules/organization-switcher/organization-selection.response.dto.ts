import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { OrganizationResponseDto } from "../organizations";
import { PositiveId } from "@voyzu/organization/types/constraints";

export const OrganizationSelectionResponseDto = StrictObject({
  organizations: Type.Array(OrganizationResponseDto),
  selectedOrganization: Type.Union([OrganizationResponseDto, Type.Null()]),
  selectedOrganizationId: Type.Union([PositiveId, Type.Null()]),
});
export type OrganizationSelectionResponseDto = Type.Static<typeof OrganizationSelectionResponseDto>;
