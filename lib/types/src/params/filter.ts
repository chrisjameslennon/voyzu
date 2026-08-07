import type { FilterOperator } from "./filter-operator";
import type { FilterValue } from "./filter-value";

export interface Filter {
  field: string;
  operator: FilterOperator;
  value?: FilterValue;
}
