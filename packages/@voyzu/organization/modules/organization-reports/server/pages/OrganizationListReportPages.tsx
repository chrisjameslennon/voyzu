import "server-only";
import type { ReactNode } from "react";

import { listCompanies } from "@voyzu/organization/companies/server";
import { getOrganization } from "@voyzu/organization/organization/server";
import { listCountries, listCountriesWithTaxConfiguration } from "@voyzu/organization/countries/server";
import { listCurrencies } from "@voyzu/organization/currencies/server";

import { OrganizationListReport, type OrganizationListReportColumn } from "./OrganizationListReport";
import { OrganizationListReportShell } from "../../client/OrganizationListReportShell";
import { organizationListReportCss } from "./organization-list-report.css";

type AnyRecord = Record<string, unknown>;
type ReportPageProps = {
  surface?: {
    searchParams?: Record<string, string>;
    unframed?: boolean;
  };
};

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function nested(row: AnyRecord, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as AnyRecord)[part];
  }, row);
}

function column<T extends AnyRecord>(key: string, label: string): OrganizationListReportColumn<T> {
  return { key, label, value: (row) => text(nested(row, key)) };
}

function widthColumn<T extends AnyRecord>(key: string, label: string, width: string): OrganizationListReportColumn<T> {
  return { key, label, width, value: (row) => text(nested(row, key)) };
}

function nowrapWidthColumn<T extends AnyRecord>(key: string, label: string, width: string): OrganizationListReportColumn<T> {
  return { key, label, width, nowrap: true, value: (row) => text(nested(row, key)) };
}

function rowsOf<T>(rows: T[]): AnyRecord[] {
  return rows as unknown as AnyRecord[];
}

function companyReportSettings(row: AnyRecord): ReactNode {
  return (
    <div className="orgListCompanyReportSettings">
      <div className="orgListCompanyReportHeadings">
        <div><span>Report heading 1:</span> {text(row.reportLine1) || "-"}</div>
        <div><span>Report heading 2:</span> {text(row.reportLine2) || "-"}</div>
      </div>
      <div><span>Report footer:</span> {text(row.reportFooter) || "-"}</div>
    </div>
  );
}

function sectionParamName(key: string): string {
  return `show${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function inactiveRowsOption(label: string) {
  return {
    label,
    rowClassName: (row: AnyRecord) => row.status === "INACTIVE" ? "orgListInactiveRow" : undefined,
  };
}

async function report<T extends AnyRecord>(
  title: string,
  printablePath: string,
  rows: T[],
  columns: OrganizationListReportColumn<T>[],
  props?: ReportPageProps,
  rowSection?: (row: T) => { section?: string; subsection?: string; sectionKey?: string },
  orientation: "portrait" | "landscape" = "portrait",
  sectionVisibilityOptions?: Array<{ key: string; label: string }>,
  detailRow?: { content: (row: T) => ReactNode; className?: string },
  inactiveRowsOption?: { label: string; rowClassName: (row: T) => string | undefined },
) {
  const organizationName = (await getOrganization())?.organizationName ?? "";
  const searchParams = props?.surface?.searchParams ?? {};
  const initialShowOrganization = searchParams.showOrganization === undefined
    ? true
    : searchParams.showOrganization === "true";
  const resolvedSectionVisibilityOptions = sectionVisibilityOptions?.map((option) => ({
    ...option,
    initialChecked: searchParams[sectionParamName(option.key)] === undefined
      ? true
      : searchParams[sectionParamName(option.key)] === "true",
  }));

  return (
    <OrganizationListReportShell
      title={title}
      printablePath={printablePath}
      initialShowOrganization={initialShowOrganization}
      orientation={orientation}
      sectionVisibilityOptions={resolvedSectionVisibilityOptions}
      inactiveRowsOption={inactiveRowsOption ? {
        label: inactiveRowsOption.label,
        initialChecked: searchParams.showInactive === "true",
      } : undefined}
      printable={props?.surface?.unframed === true}
    >
      <OrganizationListReport
        title={title}
        organizationName={organizationName}
        rows={rows}
        columns={columns}
        rowKey={(row, index) => `${text(row.code) || text(row.id) || "row"}:${index}`}
        rowSection={rowSection}
        rowClassName={inactiveRowsOption?.rowClassName}
        detailRow={detailRow}
      />
    </OrganizationListReportShell>
  );
}

export async function CompaniesReportPage(props?: ReportPageProps) {
  const rows = await listCompanies();
  return report("Companies", "/organization/reports/lists/companies/printable", rowsOf(rows), [
    widthColumn("code", "Code", "14%"),
    nowrapWidthColumn("name", "Name", "36%"),
    nowrapWidthColumn("country.name", "Country", "22%"),
    widthColumn("baseCurrencyCode", "Currency", "13%"),
    widthColumn("status", "Status", "15%"),
  ], props, undefined, "portrait", undefined, {
    className: "orgListCompanyReportSettingsRow",
    content: companyReportSettings,
  }, {
    ...inactiveRowsOption("Show inactive Companies"),
  });
}

export async function CountriesReportPage(props?: ReportPageProps) {
  const rows = await listCountries();
  return report("Countries", "/organization/reports/lists/countries/printable", rowsOf(rows), [
    column("code", "Code"),
    column("name", "Name"),
    column("currencyCode", "Currency"),
    column("status", "Status"),
  ], props, undefined, "portrait", undefined, undefined, inactiveRowsOption("Show inactive Countries"));
}

function taxRate(rate: number): string {
  return `${Number((rate * 100).toFixed(6))}%`;
}

function countryTaxSettingsDocument(organizationName: string, countries: Awaited<ReturnType<typeof listCountriesWithTaxConfiguration>>) {
  return (
    <div className="orgListDocument orgListCountryTaxDocument">
      <style>{organizationListReportCss}</style>
      <header className="orgListDocumentHeader">
        <div className="orgListOrganizationName">{organizationName}</div>
        <h2 className="orgListReportTitle">Country Tax Settings</h2>
      </header>

      {countries.map((country) => {
        const authorities = country.taxAuthorities ?? [];
        const rules = country.taxRules ?? [];
        const lines = country.taxComponents ?? [];
        return (
          <section
            className={`orgListCountryTaxSection${country.status === "INACTIVE" ? " orgListInactiveRow" : ""}`}
            key={country.code}
          >
            <header className="orgListCountryTaxHeading">
              <h3>{country.name}</h3>
              <span>{country.code} · {country.status}</span>
            </header>

            {authorities.length > 0 ? (
              <div className="orgListCountryTaxGroup">
                <h4>Tax Authorities</h4>
                <table className="orgListReportTable">
                  <thead><tr><th>Code</th><th>Name</th><th>Region</th><th>Jurisdiction</th><th>Status</th></tr></thead>
                  <tbody>{authorities.map((authority) => (
                    <tr key={authority.id}>
                      <td>{authority.code}</td><td>{authority.name}</td><td>{authority.regionCode ?? "-"}</td>
                      <td>{authority.jurisdictionLevel}</td><td>{authority.status}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : null}

            {rules.length > 0 ? (
              <div className="orgListCountryTaxGroup">
                <h4>Tax Rules</h4>
                <table className="orgListReportTable">
                  <thead><tr><th>Code</th><th>Region</th><th>Name</th><th>Invoice Label</th><th>Calculation</th><th>Lines</th><th>Status</th></tr></thead>
                  <tbody>{rules.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.code}</td><td>{rule.regionCode ?? "-"}</td><td>{rule.name}</td><td>{rule.invoiceLabel}</td>
                      <td>{rule.calculationMethod === "CONFIGURED_COMPONENTS" ? "SEE TAX RULE LINES" : rule.calculationMethod}</td>
                      <td>{rule.componentCount}</td><td>{rule.status}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : null}

            {lines.length > 0 ? (
              <div className="orgListCountryTaxGroup">
                <h4>Tax Rule Lines</h4>
                <table className="orgListReportTable">
                  <thead><tr><th>Code</th><th>Tax Rule</th><th>Authority</th><th>Scheme</th><th>Invoice Label</th><th>Rate</th><th>Status</th></tr></thead>
                  <tbody>{lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.code}</td><td>{line.taxRuleCode}</td><td>{line.taxAuthorityCode}</td><td>{line.schemeCode}</td>
                      <td>{line.invoiceLabel}</td><td>{taxRate(line.rate)}</td><td>{line.status}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : null}

            {authorities.length === 0 && rules.length === 0 && lines.length === 0 ? (
              <p className="orgListCountryTaxEmpty">No tax settings configured.</p>
            ) : null}
          </section>
        );
      })}

      <footer className="orgListDocumentFooter">Generated {new Date().toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })}</footer>
    </div>
  );
}

export async function CountryTaxSettingsReportPage(props?: ReportPageProps) {
  const [organizationName, countries] = await Promise.all([
    getOrganization().then((organization) => organization?.organizationName ?? ""),
    listCountriesWithTaxConfiguration(),
  ]);
  const searchParams = props?.surface?.searchParams ?? {};
  const initialShowOrganization = searchParams.showOrganization === undefined
    ? true
    : searchParams.showOrganization === "true";

  return (
    <OrganizationListReportShell
      title="Country Tax Settings"
      printablePath="/organization/reports/lists/country-tax-settings/printable"
      initialShowOrganization={initialShowOrganization}
      orientation="landscape"
      inactiveRowsOption={{
        label: "Show inactive Countries",
        initialChecked: searchParams.showInactive === "true",
      }}
      printable={props?.surface?.unframed === true}
    >
      {countryTaxSettingsDocument(organizationName, countries)}
    </OrganizationListReportShell>
  );
}

export async function CurrenciesReportPage(props?: ReportPageProps) {
  const rows = await listCurrencies();
  return report("Currencies", "/organization/reports/lists/currencies/printable", rowsOf(rows), [
    column("code", "Code"),
    column("name", "Name"),
    column("symbol", "Symbol"),
    column("status", "Status"),
  ], props, undefined, "portrait", undefined, undefined, inactiveRowsOption("Show inactive Currencies"));
}
