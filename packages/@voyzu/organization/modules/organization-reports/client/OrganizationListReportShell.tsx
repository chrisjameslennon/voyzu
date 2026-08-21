"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  Breadcrumbs,
  Button,
  Checkbox,
  DropdownMenu,
  type DropdownMenuItem,
} from "@voyzu/ui-components";
import layout from "@voyzu/ui-layout/css-modules/report.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

import localStyles from "./organization-list-report.module.css";

interface SectionVisibilityOption {
  key: string;
  label: string;
  initialChecked?: boolean;
}

interface OrganizationListReportShellProps {
  title: string;
  printablePath: string;
  initialShowOrganization: boolean;
  orientation?: "portrait" | "landscape";
  sectionVisibilityOptions?: SectionVisibilityOption[];
  inactiveRowsOption?: {
    label: string;
    initialChecked: boolean;
  };
  printable?: boolean;
  children: ReactNode;
}

function titleToFileSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "organization-report";
}

function sectionParamName(key: string): string {
  return `show${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function sectionParams(params: URLSearchParams, visibleSections: Record<string, boolean>, sectionVisibilityOptions: SectionVisibilityOption[]) {
  for (const option of sectionVisibilityOptions) {
    params.set(sectionParamName(option.key), String(visibleSections[option.key] !== false));
  }
}

function reportUrl(
  path: string,
  showOrganization: boolean,
  visibleSections: Record<string, boolean>,
  sectionVisibilityOptions: SectionVisibilityOption[],
  showInactive?: boolean,
): string {
  const params = new URLSearchParams({
    showOrganization: String(showOrganization),
  });
  if (showInactive !== undefined) params.set("showInactive", String(showInactive));
  sectionParams(params, visibleSections, sectionVisibilityOptions);
  return `${path}?${params.toString()}`;
}

function pdfUrl(
  path: string,
  title: string,
  showOrganization: boolean,
  visibleSections: Record<string, boolean>,
  sectionVisibilityOptions: SectionVisibilityOption[],
  orientation: "portrait" | "landscape",
  disposition: "view" | "download",
  showInactive?: boolean,
): string {
  const params = new URLSearchParams({
    path,
    filename: titleToFileSlug(title),
    showOrganization: String(showOrganization),
    orientation,
  });
  if (showInactive !== undefined) params.set("showInactive", String(showInactive));
  sectionParams(params, visibleSections, sectionVisibilityOptions);
  const endpoint = disposition === "view" ? "pdf-view" : "pdf";
  return `/api/capability/${endpoint}?${params.toString()}`;
}

export function OrganizationListReportShell({
  title,
  printablePath,
  initialShowOrganization,
  orientation = "portrait",
  sectionVisibilityOptions = [],
  inactiveRowsOption,
  printable = false,
  children,
}: OrganizationListReportShellProps) {
  const [showOrganization, setShowOrganization] = useState(initialShowOrganization);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sectionVisibilityOptions.map((option) => [option.key, option.initialChecked !== false])),
  );
  const [showInactive, setShowInactive] = useState(inactiveRowsOption?.initialChecked ?? true);
  const paperWidth = orientation === "landscape" ? "297mm" : "210mm";

  const optionItems: DropdownMenuItem[] = useMemo(
    () => [
      {
        value: "show-organization",
        label: (
          <span className={localStyles.checkboxOption}>
            <Checkbox checked={showOrganization} onChange={() => undefined} tabIndex={-1} />
            <span>Show organization header</span>
          </span>
        ),
        onSelect: () => setShowOrganization((checked) => !checked),
      },
      ...sectionVisibilityOptions.map((option) => ({
        value: `show-${option.key}`,
        label: (
          <span className={localStyles.checkboxOption}>
            <Checkbox checked={visibleSections[option.key] !== false} onChange={() => undefined} tabIndex={-1} />
            <span>{option.label}</span>
          </span>
        ),
        onSelect: () => setVisibleSections((current) => ({ ...current, [option.key]: current[option.key] === false })),
      })),
    ],
    [sectionVisibilityOptions, showOrganization, visibleSections],
  );

  const documentClassName = [
    showOrganization ? undefined : "orgListReportHideOrganization",
    inactiveRowsOption && !showInactive ? "orgListReportHideInactive" : undefined,
    ...sectionVisibilityOptions
      .filter((option) => visibleSections[option.key] === false)
      .map((option) => `orgListReportHide-${option.key}`),
  ].filter(Boolean).join(" ");

  const document = (
    <div className={documentClassName || undefined}>
      {children}
    </div>
  );

  if (printable) {
    return (
      <div className={layout.slotDocument}>
        <style>{`@media print { @page { size: A4 ${orientation}; } }`}</style>
        {document}
      </div>
    );
  }

  const openPrintable = () => {
    window.open(reportUrl(printablePath, showOrganization, visibleSections, sectionVisibilityOptions, inactiveRowsOption ? showInactive : undefined), "_blank", "noopener,noreferrer");
  };

  const openPdf = () => {
    window.open(pdfUrl(printablePath, title, showOrganization, visibleSections, sectionVisibilityOptions, orientation, "view", inactiveRowsOption ? showInactive : undefined), "_blank", "noopener,noreferrer");
  };

  const downloadPdf = () => {
    window.location.href = pdfUrl(printablePath, title, showOrganization, visibleSections, sectionVisibilityOptions, orientation, "download", inactiveRowsOption ? showInactive : undefined);
  };

  return (
    <div className={layout.reportView}>
      <header className={layout.reportHeader}>
        <div className={layout.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layout.slotTitle}>
          <div className={listStyles.titleIcon}>
            <span className={`material-symbols-outlined ${listStyles.titleIconSymbol}`}>format_list_bulleted</span>
          </div>
          <div className={layout.slotTitleText}>
            <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>{title}</h1>
          </div>
        </div>
        {inactiveRowsOption ? (
          <div className={`${layout.slotToolbarLeft} ${localStyles.toolbarLeftBottom}`}>
            <label className={localStyles.inlineCheckboxOption}>
              <Checkbox checked={showInactive} onChange={() => setShowInactive((checked) => !checked)} />
              <span>{inactiveRowsOption.label}</span>
            </label>
          </div>
        ) : null}
        <div className={layout.slotToolbarRight}>
          <DropdownMenu
            trigger={<Button variant="plain" icon="tune" title="Options" />}
            items={optionItems}
            alignment="right"
            closeOnSelect={false}
          />
          <div className={listStyles.divider} />
          <Button variant="secondary" icon="open_in_new" title="Printable Page" onClick={openPrintable} />
          <Button variant="secondary" icon="picture_as_pdf" title="View PDF" onClick={openPdf} />
          <Button variant="secondary" icon="download" title="Download PDF" onClick={downloadPdf} />
        </div>
      </header>

      <div className={layout.slotDocument}>
        <div className={layout.document} style={{ maxWidth: paperWidth }}>
          {document}
        </div>
      </div>
    </div>
  );
}
