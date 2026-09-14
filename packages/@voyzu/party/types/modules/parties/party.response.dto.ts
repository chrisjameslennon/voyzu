import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuditMetadataDto } from "@voyzu/party/types/modules/core";
import { Status } from "@voyzu/party/types/modules/core";
import { BusinessCode, NonBlankText } from "@voyzu/party/types/constraints";

export const PartyResponseDto = StrictObject({
  id: Type.Integer({ minimum: 1, description: "Existing Party identifier." }),
  code: BusinessCode,
  name: NonBlankText,
  status: Status,
  audit: AuditMetadataDto,
});
export type PartyResponseDto = Type.Static<typeof PartyResponseDto>;
