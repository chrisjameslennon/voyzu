import type { OrderBy } from "./list-order-by";
import type { Pagination } from "./list-pagination";

export interface ListOptions {
  limit?: number;
  offset?: number;
  orderBy?: OrderBy[];
  pagination?: Pagination;
}
