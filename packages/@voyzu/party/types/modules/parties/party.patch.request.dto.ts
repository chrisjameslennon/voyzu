import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { NonBlankText } from "@voyzu/party/types/constraints";

export const PartyPatchRequestDto = StrictObject({
  name: Type.Optional(NonBlankText),
}, { minProperties: 1 });
export type PartyPatchRequestDto = Type.Static<typeof PartyPatchRequestDto>;
