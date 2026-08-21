import {
  handleBatchCreate,
  handleBatchActivate,
  handleBatchDeactivate,
  handleBatchDelete,
  handleBatchGet,
  handleBatchPatch,
  handleBatchUpdate,
  handleActivate,
  handleCreate,
  handleDeactivate,
  handleDelete,
  handleFilter,
  handleGet,
  handleList,
  handlePatch,
  handleSearch,
  handleUpdate,
} from "./server/api/company.http.handlers";
import { CompaniesListPage, CompanyDetailPage } from "@voyzu/organization/companies/server";

export const pageRoutes = {
  list: {
    id: "voyzu.companies.page.list",
    pageTitle: "Companies",
    helpPath: "modules-help/organization-financial-settings/company",
    apiDocsUrl: "companies",
    path: "/organization/companies",
    Page: CompaniesListPage,
    breadcrumbBase: [
      {
        label: "Organization",
      },
    ],
    auth: { required: true, minRole: "ORGANIZATION_USER" }
  },
  detail: {
    id: "voyzu.companies.page.detail",
    pageTitle: "Company",
    helpPath: "modules-help/organization-financial-settings/company",
    apiDocsUrl: "companies",
    path: "/organization/companies/[code]",
    Page: CompanyDetailPage,
    breadcrumbBase: [
      {
        label: "Organization",
      },
      {
        label: "Companies",
        href: "/organization/companies",
      },
    ],
    auth: { required: true, minRole: "ORGANIZATION_USER" }
  }
} as const;
