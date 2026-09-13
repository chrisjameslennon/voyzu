import Type from "typebox";
import { AuditEventResponseDto } from "./audit-event.response.dto";
import { AuditEventListResponseDto } from "./audit-event.list.response.dto";

export const AuditFiltersSchema = Type.Object({ packageCode: Type.Optional(Type.String()), entityType: Type.Optional(Type.String()), entityCode: Type.Optional(Type.String()), entityId: Type.Optional(Type.String()), mutationId: Type.Optional(Type.String()), actorId: Type.Optional(Type.String()), dateFrom: Type.Optional(Type.String()), dateTo: Type.Optional(Type.String()), search: Type.Optional(Type.String()), cursor: Type.Optional(Type.String()), organization_id: Type.Optional(Type.Integer({ minimum: 1 })) }, { additionalProperties: false });

export const AuditSchema = Type.Object({
  ...Type.Omit(AuditEventResponseDto, ["organizationId"]).properties,
  organization_id: AuditEventResponseDto.properties.organizationId,
}, { additionalProperties: false });

export const AuditGetRequestDto = Type.Object({ id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const AuditGetResponseDto = Type.Union([AuditSchema, Type.Null()]);

export const AuditListResponseDto = Type.Object({ ...AuditEventListResponseDto.properties, items: Type.Array(AuditSchema) }, { additionalProperties: false });

export const AuditExportRequestDto = Type.Omit(AuditFiltersSchema, ["cursor"]);

export const AuditExportResponseDto = Type.Array(AuditSchema);

export const AuditCountRequestDto = Type.Object({  }, { additionalProperties: false });
