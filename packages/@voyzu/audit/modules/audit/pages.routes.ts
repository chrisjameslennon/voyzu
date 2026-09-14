export const pageRoutes = {
  "voyzu.audit.page.list": {
    queryParams: {
      entityCode: { type: "string" },
      entityId: { type: "string" },
      entityType: { type: "string" },
      from: { type: "string" },
      fromCode: { type: "string" },
      mutationId: { type: "string" },
    },
    httpApiDocumentationGroupId: "audit.operations",
    path: "/settings/audit",
    loadPage: () =>
      import("./server/pages/AuditEventsPage")
        .then((module) => module.AuditEventsPage),
    pageTitle: "Audit Log",
    auth: { required: true, minRole: "ADMIN" },
  },
  "voyzu.audit.page.detail": {
    pathParams: { id: { type: "string" } },
    httpApiDocumentationGroupId: "audit.operations",
    path: "/settings/audit/[id]",
    loadPage: () =>
      import("./server/pages/AuditEventDetailPage")
        .then((module) => module.AuditEventDetailPage),
    pageTitle: "Audit Event",
    breadcrumbBase: [{ label: "Audit Log", href: "/settings/audit" }],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
