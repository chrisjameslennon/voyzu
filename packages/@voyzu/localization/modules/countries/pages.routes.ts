export const pageRoutes = {
  list: {
    id: "voyzu.countries.page.list",
    pageTitle: "Countries",
    helpPath: "modules-help/organization-financial-settings/country",
    path: "/settings/localization/countries",
    loadPage: () =>
      import("./server/pages/CountriesListPage")
        .then((module) => module.CountriesListPage),
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
    id: "voyzu.countries.page.detail",
    pageTitle: "Country",
    helpPath: "modules-help/organization-financial-settings/country",
    path: "/settings/localization/countries/[code]",
    loadPage: () =>
      import("./server/pages/CountryDetailPage")
        .then((module) => module.CountryDetailPage),
    breadcrumbBase: [
      {
        label: "Settings",
        href: "/settings/users",
      },
      {
        label: "Localization",
      },
      {
        label: "Countries",
        href: "/settings/localization/countries",
      },
    ],
    auth: { required: true, minRole: "STANDARD" }
  }
} as const;
