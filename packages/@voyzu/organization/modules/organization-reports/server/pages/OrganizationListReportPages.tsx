import "server-only";

import { listOrganizations } from "@voyzu/organization/organizations/server";
import { listCountryDirectory, listCurrencyDirectory } from "../../../organizations/server/db/localization-directory.repo";

import { OrganizationListReport, type OrganizationListReportColumn } from "./OrganizationListReport";
import { OrganizationListReportShell } from "../../client/OrganizationListReportShell";

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
  detailRow?: never,
  inactiveRowsOption?: { label: string; rowClassName: (row: T) => string | undefined },
) {
  const searchParams = props?.surface?.searchParams ?? {};
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

export async function OrganizationsReportPage(props?: ReportPageProps) {
  const rows = await listOrganizations();
  return report("Organizations", "/organization/reports/lists/organizations/printable", rowsOf(rows), [
    widthColumn("code", "Code", "14%"),
    nowrapWidthColumn("name", "Name", "36%"),
    nowrapWidthColumn("country.name", "Country", "22%"),
    widthColumn("baseCurrencyCode", "Currency", "13%"),
    widthColumn("status", "Status", "15%"),
  ], props, undefined, "portrait", undefined, undefined, {
    ...inactiveRowsOption("Show inactive Organizations"),
  });
}

export async function CountriesReportPage(props?: ReportPageProps) {
  const rows = await listCountryDirectory();
  return report("Countries", "/organization/reports/lists/countries/printable", rowsOf(rows), [
    column("code", "Code"),
    column("name", "Name"),
    column("currencyCode", "Currency"),
    column("status", "Status"),
  ], props, undefined, "portrait", undefined, undefined, inactiveRowsOption("Show inactive Countries"));
}

export async function CurrenciesReportPage(props?: ReportPageProps) {
  const rows = await listCurrencyDirectory();
  return report("Currencies", "/organization/reports/lists/currencies/printable", rowsOf(rows), [
    column("code", "Code"),
    column("name", "Name"),
    column("symbol", "Symbol"),
    column("status", "Status"),
  ], props, undefined, "portrait", undefined, undefined, inactiveRowsOption("Show inactive Currencies"));
}
