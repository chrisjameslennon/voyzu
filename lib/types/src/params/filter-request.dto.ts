import type { Filter } from "./filter";
import type { ListOptions } from "./list-options";

export interface FilterRequestDto {
  filters: Filter[];
  options?: ListOptions;
}
