import Type from "typebox";
import { StrictObject } from "../api";

export const Pagination = StrictObject({
  page: Type.Integer({ minimum: 1 }),
  pageSize: Type.Integer({ minimum: 1 }),
});
export type Pagination = Type.Static<typeof Pagination>;
