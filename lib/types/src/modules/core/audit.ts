import Type from "typebox";
import { StrictObject } from "../../api";
import { ActorType } from "./enums";

export const AuditUserDto = StrictObject({
  id: Type.Integer({ minimum: 1, description: "User id." }),
  code: Type.String({ pattern: "\\S", description: "User code." }),
  displayName: Type.String({ pattern: "\\S", description: "User display name." }),
});
export type AuditUserDto = Type.Static<typeof AuditUserDto>;

export const AuditStampDto = StrictObject({
  date: Type.String({ format: "date-time", description: "Date and time for the audit event." }),
  actorType: Type.Optional(Type.Union([ActorType, Type.Null()])),
  userId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  user: Type.Optional(Type.Union([AuditUserDto, Type.Null()])),
  mutationId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type AuditStampDto = Type.Static<typeof AuditStampDto>;

export const AuditMetadataDto = StrictObject({
  created: AuditStampDto,
  updated: AuditStampDto,
});
export type AuditMetadataDto = Type.Static<typeof AuditMetadataDto>;
