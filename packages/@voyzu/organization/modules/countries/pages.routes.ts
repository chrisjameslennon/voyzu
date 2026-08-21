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
} from "@voyzu/organization/countries/server";
import { CountriesListPage, CountryDetailPage } from "@voyzu/organization/countries/server";

export const pageRoutes = {
  list: {
    id: "voyzu.countries.page.list",
    pageTitle: "Countries",
    helpPath: "modules-help/organization-financial-settings/country",
    path: "/organization/countries",
    Page: CountriesListPage,
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
    id: "voyzu.countries.page.detail",
    pageTitle: "Country",
    helpPath: "modules-help/organization-financial-settings/country",
    path: "/organization/countries/[code]",
    Page: CountryDetailPage,
    breadcrumbBase: [
      {
        label: "Organization",
      },
      {
        label: "Localization",
      },
      {
        label: "Countries",
        href: "/organization/countries",
      },
    ],
    auth: { required: true, minRole: "ORGANIZATION_USER" }
  }
} as const;
