import Type from "typebox";
import { StrictObject } from "../api";

export const CodesRequestDto = StrictObject({
  codes: Type.Array(Type.String({ pattern: "\\S" }), {
    minItems: 1,
    description: "One or more non-blank business codes identifying the records to act on.",
  }),
});
export type CodesRequestDto = Type.Static<typeof CodesRequestDto>;
