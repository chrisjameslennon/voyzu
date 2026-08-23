import type { AuditChangeRow, AuditEventRow } from "../db/audit-event.row.types";
import type { AuditChangeResponseDto, AuditEventResponseDto } from "@voyzu/audit/types";

export function mapAuditChange(row: AuditChangeRow): AuditChangeResponseDto {
  return {
    id: row.id,
    fieldPath: row.field_path,
    oldValue: row.old_value,
    newValue: row.new_value,
  };
}

export function mapAuditEvent(
  row: AuditEventRow,
  changes?: AuditChangeRow[],
): AuditEventResponseDto {
  const dto: AuditEventResponseDto = {
    id: row.id,
    code: row.code,
    packageCode: row.package_code,
    organizationId: row.organization_id,
    organizationCode: row.organization_code,
    actorType: row.actor_type,
    actorId: row.actor_id,
    actorCode: row.actor_code,
    actorDisplayName: row.actor_display_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityCode: row.entity_code,
    mutationId: row.mutation_id,
    creationDate: row.creation_date,
    changes: (changes ?? []).map(mapAuditChange),
  };
  return dto;
}
