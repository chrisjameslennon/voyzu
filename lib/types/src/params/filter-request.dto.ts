import Type from "typebox";
import { StrictObject } from "../api";
import { Filter } from "./filter";
import { ListOptions } from "./list-options";

export const FilterRequestDto = StrictObject({
  filters: Type.Array(Filter),
  options: Type.Optional(ListOptions),
});
export type FilterRequestDto = Type.Static<typeof FilterRequestDto>;
