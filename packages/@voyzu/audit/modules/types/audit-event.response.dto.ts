import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { ActorType } from "@voyzu/types/modules/core";

const NonBlankString = Type.String({ pattern: "\\S" });
const NullableNonBlankString = Type.Union([NonBlankString, Type.Null()]);
const PositiveId = Type.Integer({ minimum: 1 });

export const AuditChangeResponseDto = StrictObject({
  id: PositiveId,
  fieldPath: NonBlankString,
  oldValue: Type.Unknown(),
  newValue: Type.Unknown(),
});
export type AuditChangeResponseDto = Type.Static<typeof AuditChangeResponseDto>;
export const AuditEventResponseDto = StrictObject({
  id: PositiveId,
  code: NonBlankString,
  packageCode: NonBlankString,
  companyId: Type.Union([PositiveId, Type.Null()]),
  companyCode: NullableNonBlankString,
  actorType: Type.Union([ActorType, Type.Null()]),
  actorId: NullableNonBlankString,
  actorCode: NullableNonBlankString,
  actorDisplayName: NullableNonBlankString,
  action: NonBlankString,
  entityType: NonBlankString,
  entityId: NonBlankString,
  entityCode: NullableNonBlankString,
  mutationId: NullableNonBlankString,
  creationDate: Type.String({ format: "date-time" }),
  changes: Type.Optional(Type.Array(AuditChangeResponseDto)),
});
export type AuditEventResponseDto = Type.Static<typeof AuditEventResponseDto>;
