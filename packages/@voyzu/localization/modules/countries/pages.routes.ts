import {
  handleActivate as handleCountriesActivate,
  handleBatchActivate as handleCountriesBatchActivate,
  handleBatchCreate as handleCountriesBatchCreate,
  handleBatchDeactivate as handleCountriesBatchDeactivate,
  handleBatchDelete as handleCountriesBatchDelete,
  handleBatchGet as handleCountriesBatchGet,
  handleBatchPatch as handleCountriesBatchPatch,
  handleBatchUpdate as handleCountriesBatchUpdate,
  handleCreate as handleCountriesCreate,
  handleDeactivate as handleCountriesDeactivate,
  handleDelete as handleCountriesDelete,
  handleFilter as handleCountriesFilter,
  handleGet as handleCountriesGet,
  handleList as handleCountriesList,
  handlePatch as handleCountriesPatch,
  handleSearch as handleCountriesSearch,
  handleUpdate as handleCountriesUpdate,
} from "@voyzu/localization/countries/server";
import { CountriesListPage, CountryDetailPage } from "@voyzu/localization/countries/server";

export const pageRoutes = {
  list: {
    id: "voyzu.countries.page.list",
    pageTitle: "Countries",
    helpPath: "modules-help/organization-financial-settings/country",
    path: "/settings/localization/countries",
    Page: CountriesListPage,
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
    Page: CountryDetailPage,
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
