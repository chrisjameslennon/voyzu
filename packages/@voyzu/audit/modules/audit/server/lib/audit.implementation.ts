import type { AuditMethods } from "@voyzu/types/business-objects/audit";
import type { AuditEventResponseDto } from "@voyzu/audit/types";
import * as service from "./audit-event.service";

function record({ organizationId, changes, ...row }: AuditEventResponseDto) { return { ...row, organization_id: organizationId, changes: changes ?? [] }; }
export const auditMethods = {
  async get({ id }) { const row = await service.getAuditEvent(id); return row ? record(row) : null; },
} satisfies AuditMethods;
