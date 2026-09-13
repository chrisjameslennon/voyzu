export const pageRoutes = {
  list: {
    id: "voyzu.organizations.page.list",
    pageTitle: "Organizations",
    helpPath: "modules-help/organization-financial-settings/organization",
    apiDocsUrl: "organizations",
    path: "/organization/organizations",
    loadPage: () => import("./server/pages/OrganizationsListPage").then((module) => module.OrganizationsListPage),
    breadcrumbBase: [
      {
        label: "Organization",
      },
    ],
    auth: { required: true, minRole: "STANDARD" }
  },
  detail: {
    id: "voyzu.organizations.page.detail",
    pageTitle: "Organization",
    helpPath: "modules-help/organization-financial-settings/organization",
    apiDocsUrl: "organizations",
    path: "/organization/organizations/[code]",
    loadPage: () => import("./server/pages/OrganizationDetailPage").then((module) => module.OrganizationDetailPage),
    breadcrumbBase: [
      {
        label: "Organization",
      },
      {
        label: "Organizations",
        href: "/organization/organizations",
      },
    ],
    auth: { required: true, minRole: "STANDARD" }
  }
} as const;
