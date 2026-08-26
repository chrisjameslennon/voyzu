export const pageRoutes = {
  list: {
    id: "voyzu.audit.page.list",
    path: "/settings/audit",
    loadPage: () =>
      import("./server/pages/AuditEventsPage")
        .then((module) => module.AuditEventsPage),
    pageTitle: "Audit Log",
    auth: { required: true, minRole: "ADMIN" },
  },
  detail: {
    id: "voyzu.audit.page.detail",
    path: "/settings/audit/[id]",
    loadPage: () =>
      import("./server/pages/AuditEventDetailPage")
        .then((module) => module.AuditEventDetailPage),
    pageTitle: "Audit Event",
    breadcrumbBase: [{ label: "Audit Log", href: "/settings/audit" }],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
