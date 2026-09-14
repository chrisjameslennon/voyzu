import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, NonBlankText } from "@voyzu/party/types/constraints";

export const PartyCreateRequestDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
});
export type PartyCreateRequestDto = Type.Static<typeof PartyCreateRequestDto>;
