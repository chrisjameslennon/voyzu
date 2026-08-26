import {
  AuditEventCountResponseDto,
  AuditEventListResponseDto,
  AuditEventResponseDto,
} from "@voyzu/audit/types";
import {
  EntityNotFoundErrorResponseDto,
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types";
import Type from "typebox";

const commonResponses = {
  "400": {
    description: "Validation failed.",
    body: InputValidationErrorResponseDto,
  },
  "401": {
    description: "Authentication failed.",
    body: UnauthorizedErrorResponseDto,
  },
  "403": {
    description: "Access is forbidden.",
    body: ForbiddenErrorResponseDto,
  },
  "500": {
    description: "An unexpected server error occurred.",
    body: InternalServerErrorResponseDto,
  },
} as const;

const auditFilterParameters = {
  packageCode: { description: "Package code." },
  organizationId: { description: "Organization identifier." },
  entityType: { description: "Entity type." },
  entityCode: { description: "Entity code." },
  entityId: { description: "Entity identifier." },
  mutationId: { description: "Audit mutation identifier." },
  actorId: { description: "Actor identifier or user code." },
  dateFrom: { description: "Inclusive start date in YYYY-MM-DD format." },
  dateTo: { description: "Inclusive end date in YYYY-MM-DD format." },
  search: { description: "Free-text search value." },
} as const;

const auditFilterProperties = {
  packageCode: Type.Optional(Type.String({ pattern: "\\S" })),
  organizationId: Type.Optional(Type.Integer({ minimum: 1 })),
  entityType: Type.Optional(Type.String({ pattern: "\\S" })),
  entityCode: Type.Optional(Type.String({ pattern: "\\S" })),
  entityId: Type.Optional(Type.String({ pattern: "\\S" })),
  mutationId: Type.Optional(Type.String({ pattern: "\\S" })),
  actorId: Type.Optional(Type.String({ pattern: "\\S" })),
  dateFrom: Type.Optional(Type.String({ format: "date" })),
  dateTo: Type.Optional(Type.String({ format: "date" })),
  search: Type.Optional(Type.String({ pattern: "\\S" })),
};

const auditFilterRequest = {
  query: {
    parameters: auditFilterParameters,
    schema: Type.Object(auditFilterProperties),
  },
} as const;

const auditListRequest = {
  query: {
    parameters: {
      ...auditFilterParameters,
      cursor: { description: "Pagination cursor returned by the previous page." },
    },
    schema: Type.Object({
      ...auditFilterProperties,
      cursor: Type.Optional(Type.String({ pattern: "\\S" })),
    }),
  },
} as const;

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/audit",
    loadHandler: () => import("./server/api/audit-event.http.handlers").then((module) => module.handleList),
    request: auditListRequest,
    summary: "List audit events",
    description:
      "Lists audit events across installed packages using the supplied filters.",
    tags: ["Audit"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Matching audit events.",
        body: AuditEventListResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  count: {
    method: "GET",
    path: "/audit/count",
    loadHandler: () => import("./server/api/audit-event.http.handlers").then((module) => module.handleCount),
    request: auditFilterRequest,
    summary: "Count audit events",
    description:
      "Counts audit events across installed packages using the supplied filters.",
    tags: ["Audit"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Matching audit event count.",
        body: AuditEventCountResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  export: {
    method: "GET",
    path: "/audit/export",
    loadHandler: () => import("./server/api/audit-event.http.handlers").then((module) => module.handleExportAll),
    request: auditFilterRequest,
    summary: "Export audit events",
    description:
      "Exports audit events across installed packages using the supplied filters.",
    tags: ["Audit"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Matching audit events.",
        body: Type.Array(AuditEventResponseDto),
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  get: {
    method: "GET",
    path: "/audit/[id]",
    loadHandler: () => import("./server/api/audit-event.http.handlers").then((module) => module.handleGetById),
    request: {
      path: {
        id: {
          description: "Audit event identifier.",
          schema: Type.Integer({ minimum: 1 }),
        },
      },
    },
    summary: "Get an audit event",
    description: "Gets one audit event by identifier.",
    tags: ["Audit"],
    responses: {
      ...commonResponses,
      "200": {
        description: "The audit event.",
        body: AuditEventResponseDto,
      },
      "404": {
        description: "Audit event not found.",
        body: EntityNotFoundErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
} as const;
