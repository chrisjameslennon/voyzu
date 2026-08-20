import "server-only";

import * as auditEventService from "./server/lib/audit-event.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const countAuditEvents = operation(auditEventService.countAuditEvents);
export const listAuditEvents = operation(auditEventService.listAuditEvents);
export const exportAuditEvents = operation(auditEventService.exportAuditEvents);
export const getAuditEvent = operation(auditEventService.getAuditEvent);

export const operations = {
  countAuditEvents,
  listAuditEvents,
  exportAuditEvents,
  getAuditEvent,
} as const;
