import "server-only";

import * as service from "./server/lib/audit-event.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const countAuditEvents = operation(service.countAuditEvents);
export const listAuditEvents = operation(service.listAuditEvents);
export const exportAuditEvents = operation(service.exportAuditEvents);
export const getAuditEvent = operation(service.getAuditEvent);

export const operations = {
  countAuditEvents,
  listAuditEvents,
  exportAuditEvents,
  getAuditEvent,
} as const;
