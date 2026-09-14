import Type from "typebox";
import { AuditEventResponseDto, AuditChangeResponseDto } from "./audit-event.response.dto";

export const AuditSchema = Type.Object({
  ...Type.Omit(AuditEventResponseDto, ["organizationId"]).properties,
  organization_id: AuditEventResponseDto.properties.organizationId,
  changes: Type.Array(AuditChangeResponseDto),
}, { additionalProperties: false });

export const AuditGetRequestDto = Type.Object({ id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const AuditGetResponseDto = Type.Union([AuditSchema, Type.Null()]);
