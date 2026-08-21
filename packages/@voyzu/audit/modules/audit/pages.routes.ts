import { AuditEventDetailPage, AuditEventsPage } from "./server";

export const pageRoutes = {
  list: { id: "voyzu.audit.page.list", path: "/settings/audit", Page: AuditEventsPage, pageTitle: "Audit Log", auth: { required: true, minRole: "ADMIN" } },
  detail: { id: "voyzu.audit.page.detail", path: "/settings/audit/[id]", Page: AuditEventDetailPage, pageTitle: "Audit Event", breadcrumbBase: [{ label: "Audit Log", href: "/settings/audit" }], auth: { required: true, minRole: "ADMIN" } },
} as const;
