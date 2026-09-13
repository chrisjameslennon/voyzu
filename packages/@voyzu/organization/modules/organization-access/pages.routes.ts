export const pageRoutes = {
  list: {
    id: "voyzu.organization-access.page.list",
    path: "/organization/organization-access",
    loadPage: () => import("./server/pages/OrganizationAccessPage").then((module) => module.OrganizationAccessPage),
    pageTitle: "Organization Access",
    apiDocsUrl: "organization-access",
    breadcrumbBase: [{ label: "Organization" }],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
