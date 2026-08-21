import "server-only";
import type { ReactNode } from "react";

import { organizationListReportCss } from "./organization-list-report.css";

export interface OrganizationListReportColumn<T> {
  key: string;
  label: string;
  width?: string;
  nowrap?: boolean;
  value: (row: T) => ReactNode;
}

export interface OrganizationListReportDetailRow<T> {
  content: (row: T) => ReactNode;
  className?: string;
}

interface OrganizationListReportSection {
  section?: string;
  subsection?: string;
  sectionKey?: string;
}

interface OrganizationListReportProps<T> {
  title: string;
  organizationName: string;
  rows: T[];
  columns: OrganizationListReportColumn<T>[];
  rowKey: (row: T, index: number) => string;
  rowSection?: (row: T) => OrganizationListReportSection;
  rowClassName?: (row: T) => string | undefined;
  detailRow?: OrganizationListReportDetailRow<T>;
}

function valueContent(value: ReactNode): ReactNode {
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function generatedAt(): string {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrganizationListReport<T>({
  title,
  organizationName,
  rows,
  columns,
  rowKey,
  rowSection,
  rowClassName,
  detailRow,
}: OrganizationListReportProps<T>) {
  let currentSection = "";
  let currentSubsection = "";
  let currentSectionKey = "";

  return (
    <div className="orgListDocument">
      <style>{organizationListReportCss}</style>
      <header className="orgListDocumentHeader">
        <div className="orgListOrganizationName">{organizationName}</div>
        <h2 className="orgListReportTitle">{title}</h2>
      </header>

      <table className="orgListReportTable">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.nowrap ? { whiteSpace: "nowrap" } : undefined}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const section = rowSection?.(row) ?? {};
            const rowsToRender = [];

            if (section.section && section.section !== currentSection) {
              currentSection = section.section;
              currentSubsection = "";
              currentSectionKey = section.sectionKey ?? "";
              rowsToRender.push(
                <tr key={`${rowKey(row, index)}:section`} className={`orgListSectionRow ${currentSectionKey ? `orgListReportSection-${currentSectionKey}` : ""}`}>
                  <td colSpan={columns.length}>{section.section}</td>
                </tr>,
              );
            }

            if (section.subsection && section.subsection !== currentSubsection) {
              currentSubsection = section.subsection;
              rowsToRender.push(
                <tr key={`${rowKey(row, index)}:subsection`} className={`orgListSubsectionRow ${currentSectionKey ? `orgListReportSection-${currentSectionKey}` : ""}`}>
                  <td colSpan={columns.length}>{section.subsection}</td>
                </tr>,
              );
            }

            rowsToRender.push(
              <tr
                key={rowKey(row, index)}
                className={[
                  currentSectionKey ? `orgListReportSection-${currentSectionKey}` : "",
                  detailRow ? "orgListHasDetailRow" : "",
                  rowClassName?.(row) ?? "",
                ].filter(Boolean).join(" ") || undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} style={column.nowrap ? { whiteSpace: "nowrap" } : undefined}>{valueContent(column.value(row))}</td>
                ))}
              </tr>,
            );

            if (detailRow) {
              rowsToRender.push(
                <tr
                  key={`${rowKey(row, index)}:detail`}
                  className={[detailRow.className, rowClassName?.(row)].filter(Boolean).join(" ") || undefined}
                >
                  <td colSpan={columns.length}>{detailRow.content(row)}</td>
                </tr>,
              );
            }

            return rowsToRender;
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="orgListEmptyCell">
                No rows found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <footer className="orgListDocumentFooter">
        Generated {generatedAt()}
      </footer>
    </div>
  );
}
