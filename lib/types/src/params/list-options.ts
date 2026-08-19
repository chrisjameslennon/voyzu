import Type from "typebox";
import { StrictObject } from "../api";
import { OrderBy } from "./list-order-by";
import { Pagination } from "./list-pagination";

export const ListOptions = StrictObject({
  limit: Type.Optional(Type.Integer({ minimum: 1 })),
  offset: Type.Optional(Type.Integer({ minimum: 0 })),
  orderBy: Type.Optional(Type.Array(OrderBy)),
  pagination: Type.Optional(Pagination),
});
export type ListOptions = Type.Static<typeof ListOptions>;
