import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { arrayOf, dtoRef } from "@voyzu/types/api";
import { handleCount, handleExportAll, handleGetById, handleList } from "./server";

const commonResponses = {
  "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") },
  "401": { description: "Authentication failed.", body: dtoRef("UnauthorizedErrorResponseDto") },
  "403": { description: "Access is forbidden.", body: dtoRef("ForbiddenErrorResponseDto") },
  "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
} as const;

/** Core audit persistence and query capability. */
export const auditModule = {
  pageRoutes: {},
  apiDefinitions: {
    list: {
      method: "GET",
      path: "/audit",
      handler: (request: any) => handleList(request),
      summary: "List audit events",
      description: "Lists audit events across installed packages using the supplied filters.",
      tags: ["Audit"],
      responses: {
        ...commonResponses,
        "200": { description: "Matching audit events.", body: dtoRef("AuditEventListResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    count: {
      method: "GET",
      path: "/audit/count",
      handler: (request: any) => handleCount(request),
      summary: "Count audit events",
      description: "Counts audit events across installed packages using the supplied filters.",
      tags: ["Audit"],
      responses: {
        ...commonResponses,
        "200": { description: "Matching audit event count.", body: dtoRef("AuditEventCountResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    export: {
      method: "GET",
      path: "/audit/export",
      handler: (request: any) => handleExportAll(request),
      summary: "Export audit events",
      description: "Exports audit events across installed packages using the supplied filters.",
      tags: ["Audit"],
      responses: {
        ...commonResponses,
        "200": { description: "Matching audit events.", body: arrayOf(dtoRef("AuditEventResponseDto")) }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    get: {
      method: "GET",
      path: "/audit/[id]",
      handler: (request: any, context: any) => handleGetById(request, context),
      request: { path: { id: { description: "Audit event identifier.", schema: { type: "string" } } } },
      summary: "Get an audit event",
      description: "Gets one audit event by identifier.",
      tags: ["Audit"],
      responses: {
        ...commonResponses,
        "200": { description: "The audit event.", body: dtoRef("AuditEventResponseDto") }, "404": { description: "Audit event not found.", body: dtoRef("EntityNotFoundErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;

export default auditModule;
