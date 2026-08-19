import type { AuditEventListResponseDto, AuditEventResponseDto } from "@voyzu/audit/types";
import { getDb } from "@voyzu/capability/db";
import { AuditEventRepo, type AuditEventFilters } from "../db/audit-event.repo";
import { mapAuditEvent } from "./audit-event.mapper";

export async function countAuditEvents(): Promise<number> {
  return new AuditEventRepo(getDb()).countTotal();
}

export async function listAuditEvents(filters: AuditEventFilters = {}): Promise<AuditEventListResponseDto> {
  const { rows, nextCursor, totalMatching } = await new AuditEventRepo(getDb()).listEvents(filters);
  return {
    items: rows.map((r) => mapAuditEvent(r)),
    nextCursor,
    totalMatching,
  };
}

export async function exportAuditEvents(filters: Omit<AuditEventFilters, "cursor"> = {}): Promise<AuditEventResponseDto[]> {
  const rows = await new AuditEventRepo(getDb()).listAllForExport(filters);
  return rows.map((r) => mapAuditEvent(r));
}

export async function getAuditEvent(id: number): Promise<AuditEventResponseDto | null> {
  const result = await new AuditEventRepo(getDb()).getEventById(id);
  if (!result) return null;
  const { changes, ...event } = result;
  return mapAuditEvent(event, changes);
}
