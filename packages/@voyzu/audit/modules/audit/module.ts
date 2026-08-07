import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { arrayOf, dtoRef } from "@voyzu/types/api";
import { handleCount, handleExportAll, handleGetById, handleList } from "./server";

/** Core audit persistence and query capability. */
export const auditModule = {
  pageRoutes: {},
  apiDefinitions: {
    list: {
      method: "GET",
      path: "/audit",
      handler: (request: any) => handleList(request),
      apiDoc: {
        summary: "List audit events",
        description: "Lists audit events across installed packages using the supplied filters.",
        tags: ["Audit"],
        responses: { "200": { description: "Matching audit events.", schema: dtoRef("AuditEventListResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    count: {
      method: "GET",
      path: "/audit/count",
      handler: (request: any) => handleCount(request),
      apiDoc: {
        summary: "Count audit events",
        description: "Counts audit events across installed packages using the supplied filters.",
        tags: ["Audit"],
        responses: { "200": { description: "Matching audit event count.", schema: dtoRef("AuditEventCountResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    export: {
      method: "GET",
      path: "/audit/export",
      handler: (request: any) => handleExportAll(request),
      apiDoc: {
        summary: "Export audit events",
        description: "Exports audit events across installed packages using the supplied filters.",
        tags: ["Audit"],
        responses: { "200": { description: "Matching audit events.", schema: arrayOf(dtoRef("AuditEventResponseDto")) }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    get: {
      method: "GET",
      path: "/audit/[id]",
      handler: (request: any, context: any) => handleGetById(request, context),
      apiDoc: {
        summary: "Get an audit event",
        description: "Gets one audit event by identifier.",
        tags: ["Audit"],
        requestPathParams: { id: { description: "Audit event identifier.", schema: { type: "string" } } },
        responses: { "200": { description: "The audit event.", schema: dtoRef("AuditEventResponseDto") }, "404": { description: "Audit event not found.", schema: dtoRef("EntityNotFoundErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;

export default auditModule;
