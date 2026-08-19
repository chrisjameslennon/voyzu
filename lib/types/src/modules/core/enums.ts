import Type from "typebox";

export const Status = Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]);
export type Status = Type.Static<typeof Status>;

export const ActorType = Type.Union([
  Type.Literal("APP"),
  Type.Literal("API"),
  Type.Literal("SYSTEM"),
]);
export type ActorType = Type.Static<typeof ActorType>;
