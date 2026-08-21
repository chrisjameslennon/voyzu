import { handleActivate as handleCurrenciesActivate, handleBatchActivate as handleCurrenciesBatchActivate, handleBatchCreate as handleCurrenciesBatchCreate, handleBatchDeactivate as handleCurrenciesBatchDeactivate, handleBatchDelete as handleCurrenciesBatchDelete, handleBatchGet as handleCurrenciesBatchGet, handleBatchPatch as handleCurrenciesBatchPatch, handleBatchUpdate as handleCurrenciesBatchUpdate, handleCreate as handleCurrenciesCreate, handleDeactivate as handleCurrenciesDeactivate, handleDelete as handleCurrenciesDelete, handleFilter as handleCurrenciesFilter, handleGet as handleCurrenciesGet, handleList as handleCurrenciesList, handlePatch as handleCurrenciesPatch, handleSearch as handleCurrenciesSearch, handleUpdate as handleCurrenciesUpdate } from "@voyzu/organization/currencies/server";
import { CurrenciesListPage, CurrencyDetailPage } from "@voyzu/organization/currencies/server";

export const pageRoutes = {
  list: {
    id: "voyzu.currencies.page.list",
    pageTitle: "Currencies",
    helpPath: "modules-help/organization-financial-settings/currency",
    path: "/organization/currencies",
    Page: CurrenciesListPage,
    breadcrumbBase: [
      {
        label: "Organization",
      },
      {
        label: "Localization",
      },
    ],
    auth: { required: true, minRole: "ORGANIZATION_USER" }
  },
  detail: {
    id: "voyzu.currencies.page.detail",
    pageTitle: "Currency",
    helpPath: "modules-help/organization-financial-settings/currency",
    path: "/organization/currencies/[code]",
    Page: CurrencyDetailPage,
    breadcrumbBase: [
      {
        label: "Organization",
      },
      {
        label: "Localization",
      },
      {
        label: "Currencies",
        href: "/organization/currencies",
      },
    ],
    auth: { required: true, minRole: "ORGANIZATION_USER" }
  }
} as const;
