import type { AuditEventListResponseDto, AuditEventResponseDto } from "@voyzu/audit/types";
import { getDb } from "@voyzu/capability/db";
import { withResponseValidation } from "@voyzu/capability/validation";
import { AuditEventRepo, type AuditEventFilters } from "../db/audit-event.repo";
import { mapAuditEvent } from "./audit-event.mapper";

export async function countAuditEvents(): Promise<number> {
  return new AuditEventRepo(getDb()).countTotal();
}

async function listAuditEventsUnchecked(filters: AuditEventFilters = {}): Promise<AuditEventListResponseDto> {
  const { rows, nextCursor, totalMatching } = await new AuditEventRepo(getDb()).listEvents(filters);
  return {
    items: rows.map((r) => mapAuditEvent(r)),
    nextCursor,
    totalMatching,
  };
}

async function exportAuditEventsUnchecked(filters: Omit<AuditEventFilters, "cursor"> = {}): Promise<AuditEventResponseDto[]> {
  const rows = await new AuditEventRepo(getDb()).listAllForExport(filters);
  return rows.map((r) => mapAuditEvent(r));
}

async function getAuditEventUnchecked(id: number): Promise<AuditEventResponseDto | null> {
  const result = await new AuditEventRepo(getDb()).getEventById(id);
  if (!result) return null;
  const { changes, ...event } = result;
  return mapAuditEvent(event, changes);
}

export const listAuditEvents = withResponseValidation(listAuditEventsUnchecked, "audit event list");
export const exportAuditEvents = withResponseValidation(exportAuditEventsUnchecked, "audit event export");
export const getAuditEvent = withResponseValidation(getAuditEventUnchecked, "audit event detail");

