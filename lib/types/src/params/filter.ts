import Type from "typebox";
import { StrictObject } from "../api";
import { FilterOperator } from "./filter-operator";
import { FilterValue } from "./filter-value";

export const Filter = StrictObject({
  field: Type.String({ pattern: "\\S" }),
  operator: FilterOperator,
  value: Type.Optional(FilterValue),
});
export type Filter = Type.Static<typeof Filter>;
