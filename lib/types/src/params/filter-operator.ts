import Type from "typebox";

export const FilterOperator = Type.Union([
  Type.Literal("="), Type.Literal("!="), Type.Literal("<"), Type.Literal("<="),
  Type.Literal(">"), Type.Literal(">="), Type.Literal("IN"), Type.Literal("NOT IN"),
  Type.Literal("LIKE"), Type.Literal("ILIKE"), Type.Literal("BETWEEN"),
  Type.Literal("IS NULL"), Type.Literal("IS NOT NULL"),
]);
export type FilterOperator = Type.Static<typeof FilterOperator>;
