import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { PartyUpdateRequestDto } from "./party.update.request.dto";
import { BusinessCode } from "@voyzu/party/types/constraints";

export const PartyBatchUpdateRequestDto = StrictObject({
  ...PartyUpdateRequestDto.properties,
  code: BusinessCode,
});
export type PartyBatchUpdateRequestDto = Type.Static<typeof PartyBatchUpdateRequestDto>;
