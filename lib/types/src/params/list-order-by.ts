import Type from "typebox";
import { StrictObject } from "../api";

export const OrderBy = StrictObject({
  field: Type.String({ pattern: "\\S" }),
  direction: Type.Optional(Type.Union([Type.Literal("ASC"), Type.Literal("DESC")])),
});
export type OrderBy = Type.Static<typeof OrderBy>;
