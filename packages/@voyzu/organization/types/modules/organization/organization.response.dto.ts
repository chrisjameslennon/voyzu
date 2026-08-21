import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto } from "@voyzu/organization/types/modules/core";
import { Status } from "@voyzu/organization/types/modules/core";
import { BusinessCode, NonBlankText, PositiveId } from "@voyzu/organization/types/constraints";

export const OrganizationResponseDto = StrictObject({
  id: PositiveId,
  code: BusinessCode,
  organizationName: NonBlankText,
  status: Status,
  hasPostings: Type.Boolean({ description: "True when one or more posted journal headers exist for any company in this organization." }),
  audit: AuditMetadataDto,
});
export type OrganizationResponseDto = Type.Static<typeof OrganizationResponseDto>;
