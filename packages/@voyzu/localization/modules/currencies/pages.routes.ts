import { handleActivate as handleCurrenciesActivate, handleBatchActivate as handleCurrenciesBatchActivate, handleBatchCreate as handleCurrenciesBatchCreate, handleBatchDeactivate as handleCurrenciesBatchDeactivate, handleBatchDelete as handleCurrenciesBatchDelete, handleBatchGet as handleCurrenciesBatchGet, handleBatchPatch as handleCurrenciesBatchPatch, handleBatchUpdate as handleCurrenciesBatchUpdate, handleCreate as handleCurrenciesCreate, handleDeactivate as handleCurrenciesDeactivate, handleDelete as handleCurrenciesDelete, handleFilter as handleCurrenciesFilter, handleGet as handleCurrenciesGet, handleList as handleCurrenciesList, handlePatch as handleCurrenciesPatch, handleSearch as handleCurrenciesSearch, handleUpdate as handleCurrenciesUpdate } from "@voyzu/localization/currencies/server";
import { CurrenciesListPage, CurrencyDetailPage } from "@voyzu/localization/currencies/server";

export const pageRoutes = {
  list: {
    id: "voyzu.currencies.page.list",
    pageTitle: "Currencies",
    helpPath: "modules-help/organization-financial-settings/currency",
    path: "/settings/localization/currencies",
    Page: CurrenciesListPage,
    breadcrumbBase: [
      {
        label: "Settings",
        href: "/settings/users",
      },
      {
        label: "Localization",
      },
    ],
    auth: { required: true, minRole: "STANDARD" }
  },
  detail: {
    id: "voyzu.currencies.page.detail",
    pageTitle: "Currency",
    helpPath: "modules-help/organization-financial-settings/currency",
    path: "/settings/localization/currencies/[code]",
    Page: CurrencyDetailPage,
    breadcrumbBase: [
      {
        label: "Settings",
        href: "/settings/users",
      },
      {
        label: "Localization",
      },
      {
        label: "Currencies",
        href: "/settings/localization/currencies",
      },
    ],
    auth: { required: true, minRole: "STANDARD" }
  }
} as const;
