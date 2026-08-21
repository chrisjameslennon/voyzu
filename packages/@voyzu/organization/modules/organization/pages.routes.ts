import { handleGetOrganization, handleUpdateOrganization } from "@voyzu/organization/organization/server";
import { OrganizationPage } from "@voyzu/organization/organization/server";

export const pageRoutes = {
  detail: {
    id: "voyzu.organization.page.detail",
    pageTitle: "Organization",
    helpPath: "modules-help/organization-financial-settings/organization",
    path: "/organization",
    Page: OrganizationPage,
    breadcrumbBase: [],
    auth: { required: true, minRole: "ORGANIZATION_USER" }
  }
} as const;
