import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { BusinessCode40, NonBlankText } from "@voyzu/organization/types/constraints";

export const OrganizationUpdateRequestDto = StrictObject({
  code: Type.Optional(BusinessCode40),
  organizationName: NonBlankText,
});
export type OrganizationUpdateRequestDto = Type.Static<typeof OrganizationUpdateRequestDto>;
