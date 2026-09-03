import "server-only";

import { command } from "@voyzu/capability/commands";
import {
  AuditEventListResponseDto,
  AuditEventResponseDto,
} from "@voyzu/audit/types";
import Type, { type TSchema } from "typebox";

const AuditEventFilters = Type.Object({
  packageCode: Type.Optional(Type.String()),
  organizationId: Type.Optional(Type.String()),
  entityType: Type.Optional(Type.String()),
  entityCode: Type.Optional(Type.String()),
  entityId: Type.Optional(Type.String()),
  mutationId: Type.Optional(Type.String()),
  actorId: Type.Optional(Type.String()),
  dateFrom: Type.Optional(Type.String()),
  dateTo: Type.Optional(Type.String()),
  search: Type.Optional(Type.String()),
  cursor: Type.Optional(Type.String()),
}, { additionalProperties: false });

const AuditEventExportFilters = Type.Omit(AuditEventFilters, ["cursor"]);

const optionalFilters = (filters: TSchema) => Type.Union([
  Type.Tuple([]),
  Type.Tuple([filters]),
]);

export const countAuditEvents = command.defineLazy(
  { parameters: Type.Tuple([]), result: Type.Number() },
  () => import("./server/lib/audit-event.service").then((module) => module.countAuditEvents),
);

export const listAuditEvents = command.defineLazy(
  { parameters: optionalFilters(AuditEventFilters), result: AuditEventListResponseDto },
  () => import("./server/lib/audit-event.service").then((module) => module.listAuditEvents),
);

export const exportAuditEvents = command.defineLazy(
  {
    parameters: optionalFilters(AuditEventExportFilters),
    result: Type.Array(AuditEventResponseDto),
  },
  () => import("./server/lib/audit-event.service").then((module) => module.exportAuditEvents),
);

export const getAuditEvent = command.defineLazy(
  {
    parameters: Type.Tuple([Type.Integer({ minimum: 1 })]),
    result: Type.Union([AuditEventResponseDto, Type.Null()]),
  },
  () => import("./server/lib/audit-event.service").then((module) => module.getAuditEvent),
);

export const commands = {
  countAuditEvents,
  listAuditEvents,
  exportAuditEvents,
  getAuditEvent,
} as const;
