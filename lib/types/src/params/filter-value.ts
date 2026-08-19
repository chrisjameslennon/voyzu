import Type from "typebox";

export const FilterValue = Type.Union([
  Type.String(), Type.Number(), Type.Boolean(), Type.Null(),
  Type.Array(Type.Union([Type.String(), Type.Number()])),
]);
export type FilterValue = Type.Static<typeof FilterValue>;
