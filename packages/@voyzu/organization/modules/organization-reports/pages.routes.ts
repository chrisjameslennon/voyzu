const breadcrumbBase = [{ label: "Organization" }, { label: "Reports" }, { label: "Lists" }] as const;
const auth = { required: true, minRole: "STANDARD" } as const;
const loadReportPages = () => import("./server/pages/OrganizationListReportPages");
const loadOrganizationsReportPage = () => loadReportPages().then((module) => module.OrganizationsReportPage);
const loadCountriesReportPage = () => loadReportPages().then((module) => module.CountriesReportPage);
const loadCurrenciesReportPage = () => loadReportPages().then((module) => module.CurrenciesReportPage);

export const pageRoutes = {
  organizations: { id: "voyzu.organizationReports.page.organizations", pageTitle: "Organizations", path: "/organization/reports/lists/organizations", loadPage: loadOrganizationsReportPage, breadcrumbBase, auth },
  countries: { id: "voyzu.organizationReports.page.countries", pageTitle: "Countries", path: "/organization/reports/lists/countries", loadPage: loadCountriesReportPage, breadcrumbBase, auth },
  currencies: { id: "voyzu.organizationReports.page.currencies", pageTitle: "Currencies", path: "/organization/reports/lists/currencies", loadPage: loadCurrenciesReportPage, breadcrumbBase, auth },
  organizationsPrintable: { id: "voyzu.organizationReports.page.organizations.printable", pageTitle: "Organizations", path: "/organization/reports/lists/organizations/printable", loadPage: loadOrganizationsReportPage, unframed: true, auth },
  countriesPrintable: { id: "voyzu.organizationReports.page.countries.printable", pageTitle: "Countries", path: "/organization/reports/lists/countries/printable", loadPage: loadCountriesReportPage, unframed: true, auth },
  currenciesPrintable: { id: "voyzu.organizationReports.page.currencies.printable", pageTitle: "Currencies", path: "/organization/reports/lists/currencies/printable", loadPage: loadCurrenciesReportPage, unframed: true, auth },
} as const;
