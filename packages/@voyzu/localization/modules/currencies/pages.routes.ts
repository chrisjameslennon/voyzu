export const pageRoutes = {
  "voyzu.currencies.page.list": {

    httpApiDocumentationGroupId: "localization.operations",
    pageTitle: "Currencies",
    helpPath: "modules-help/organization-financial-settings/currency",
    path: "/settings/localization/currencies",
    loadPage: () =>
      import("./server/pages/CurrenciesListPage")
        .then((module) => module.CurrenciesListPage),
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
  "voyzu.currencies.page.detail": {
    pathParams: { code: { type: "string" } },
    httpApiDocumentationGroupId: "localization.operations",
    pageTitle: "Currency",
    helpPath: "modules-help/organization-financial-settings/currency",
    path: "/settings/localization/currencies/[code]",
    loadPage: () =>
      import("./server/pages/CurrencyDetailPage")
        .then((module) => module.CurrencyDetailPage),
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
