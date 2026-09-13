import type { AuditMethods } from "@voyzu/types/business-objects/audit";
import type { AuditEventResponseDto } from "@voyzu/audit/types";
import * as service from "./audit-event.service";

function record({ organizationId, ...row }: AuditEventResponseDto) { return { ...row, organization_id: organizationId }; }
export const auditMethods = {
  async get({ id }) { const row = await service.getAuditEvent(id); return row ? record(row) : null; },
  async list({ organization_id, ...filters }) {
    const result = await service.listAuditEvents({ ...filters, organizationId: organization_id === undefined ? undefined : String(organization_id) });
    return { ...result, items: result.items.map(record) };
  },
  async export({ organization_id, ...filters }) { return (await service.exportAuditEvents({ ...filters, organizationId: organization_id === undefined ? undefined : String(organization_id) })).map(record); },
  async count() { return { count: await service.countAuditEvents() }; },
} satisfies AuditMethods;
