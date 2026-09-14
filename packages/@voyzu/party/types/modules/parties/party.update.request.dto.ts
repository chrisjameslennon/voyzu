import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { NonBlankText } from "@voyzu/party/types/constraints";

export const PartyUpdateRequestDto = StrictObject({
  name: NonBlankText,
});
export type PartyUpdateRequestDto = Type.Static<typeof PartyUpdateRequestDto>;
