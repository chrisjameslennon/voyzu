import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { PartyPatchRequestDto } from "./party.patch.request.dto";
import { BusinessCode } from "@voyzu/party/types/constraints";

export const PartyBatchPatchRequestDto = StrictObject({
  ...PartyPatchRequestDto.properties,
  code: BusinessCode,
});
export type PartyBatchPatchRequestDto = Type.Static<typeof PartyBatchPatchRequestDto>;
