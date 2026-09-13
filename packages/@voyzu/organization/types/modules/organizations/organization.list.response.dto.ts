import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { OrganizationResponseDto } from "./organization.response.dto";

export const OrganizationListResponseDto = StrictObject({
  items: Type.Array(OrganizationResponseDto),
  totalMatching: Type.Number(),
});
export type OrganizationListResponseDto = Type.Static<typeof OrganizationListResponseDto>;
