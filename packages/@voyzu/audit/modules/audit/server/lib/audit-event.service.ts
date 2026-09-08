import type { AuditEventListResponseDto, AuditEventResponseDto } from "@voyzu/audit/types";
import { getDb } from "@voyzu/capability/db";
import { AuditEventRepo, type AuditEventFilters } from "../db/audit-event.repo";
import type { AuditEventRow } from "../db/audit-event.row.types";
import { mapAuditEvent } from "./audit-event.mapper";
import { listAuditOrganizations } from "./organization-directory";

async function addOrganizationCodes(rows: AuditEventRow[]): Promise<AuditEventRow[]> {
  if (!rows.some((row) => row.organization_id !== null && row.organization_code === null)) {
    return rows;
  }

  const organizations = await listAuditOrganizations();

  const codesById = new Map(
    organizations
      .map((organization) => [organization.id, organization.code]),
  );
  return rows.map((row) => ({
    ...row,
    organization_code:
      row.organization_code
      ?? (row.organization_id === null ? null : codesById.get(row.organization_id) ?? null),
  }));
}

export async function countAuditEvents(): Promise<number> {
  return new AuditEventRepo(getDb()).countTotal();
}

export async function listAuditEvents(filters: AuditEventFilters = {}): Promise<AuditEventListResponseDto> {
  const { rows, nextCursor, totalMatching } = await new AuditEventRepo(getDb()).listEvents(filters);
  const enrichedRows = await addOrganizationCodes(rows);
  return {
    items: enrichedRows.map((r) => mapAuditEvent(r)),
    nextCursor,
    totalMatching,
  };
}

export async function exportAuditEvents(filters: Omit<AuditEventFilters, "cursor"> = {}): Promise<AuditEventResponseDto[]> {
  const rows = await new AuditEventRepo(getDb()).listAllForExport(filters);
  return (await addOrganizationCodes(rows)).map((r) => mapAuditEvent(r));
}

export async function getAuditEvent(id: number): Promise<AuditEventResponseDto | null> {
  const result = await new AuditEventRepo(getDb()).getEventById(id);
  if (!result) return null;
  const { changes, ...event } = result;
  const [enrichedEvent] = await addOrganizationCodes([event]);
  return mapAuditEvent(enrichedEvent!, changes);
}
