export const pageRoutes = {
  "voyzu.organizations.page.list": {

    httpApiDocumentationGroupId: "organization.operations",
    pageTitle: "Organizations",
    helpPath: "modules-help/organization-financial-settings/organization",
    httpApiDocsUrl: "organizations",
    path: "/organization/organizations",
    loadPage: () => import("./server/pages/OrganizationsListPage").then((module) => module.OrganizationsListPage),
    breadcrumbBase: [
      {
        label: "Organization",
      },
    ],
    auth: { required: true, minRole: "STANDARD" }
  },
  "voyzu.organizations.page.detail": {
    pathParams: { code: { type: "string" } },
    httpApiDocumentationGroupId: "organization.operations",
    pageTitle: "Organization",
    helpPath: "modules-help/organization-financial-settings/organization",
    httpApiDocsUrl: "organizations",
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
