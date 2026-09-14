const breadcrumbBase = [{ label: "Organization" }, { label: "Reports" }, { label: "Lists" }] as const;
const auth = { required: true, minRole: "STANDARD" } as const;
const loadReportPages = () => import("./server/pages/OrganizationListReportPages");
const loadOrganizationsReportPage = () => loadReportPages().then((module) => module.OrganizationsReportPage);
const loadCountriesReportPage = () => loadReportPages().then((module) => module.CountriesReportPage);
const loadCurrenciesReportPage = () => loadReportPages().then((module) => module.CurrenciesReportPage);

export const pageRoutes = {
  "voyzu.organizationReports.page.organizations": {
    queryParams: {
      showInactive: { type: "boolean" } },  pageTitle: "Organizations", path: "/organization/reports/lists/organizations", loadPage: loadOrganizationsReportPage, breadcrumbBase, auth,
    },
  "voyzu.organizationReports.page.countries": {
    queryParams: {
      showInactive: { type: "boolean" } },  pageTitle: "Countries", path: "/organization/reports/lists/countries", loadPage: loadCountriesReportPage, breadcrumbBase, auth,
    },
  "voyzu.organizationReports.page.currencies": {
    queryParams: {
      showInactive: { type: "boolean" } },  pageTitle: "Currencies", path: "/organization/reports/lists/currencies", loadPage: loadCurrenciesReportPage, breadcrumbBase, auth,
    },
  "voyzu.organizationReports.page.organizations.printable": {
    queryParams: {
      showInactive: { type: "boolean" } },  pageTitle: "Organizations", path: "/organization/reports/lists/organizations/printable", loadPage: loadOrganizationsReportPage, unframed: true, auth,
    },
  "voyzu.organizationReports.page.countries.printable": {
    queryParams: {
      showInactive: { type: "boolean" } },  pageTitle: "Countries", path: "/organization/reports/lists/countries/printable", loadPage: loadCountriesReportPage, unframed: true, auth,
    },
  "voyzu.organizationReports.page.currencies.printable": {
    queryParams: {
      showInactive: { type: "boolean" } },  pageTitle: "Currencies", path: "/organization/reports/lists/currencies/printable", loadPage: loadCurrenciesReportPage, unframed: true, auth,
    },
} as const;
