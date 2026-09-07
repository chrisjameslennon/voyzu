export const printableDocumentCss = `
.voyzuPrintreportPage {
  --report-font: "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --text-main: #1f1f1f;
  --text-muted: #6b7280;
  --line-strong: #404040;
  --line-mid: #d8d8d8;
  --line-soft: #ececec;
  box-sizing: border-box;
  font-family: var(--report-font);
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-main);
  background: #fff;
}
.voyzuPrintreportPage * { box-sizing: border-box; }
.voyzuPrintreportHeader { margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1.5px solid var(--line-strong); }
.voyzuPrintreportCompanyName { margin: 0; font-size: 28px; line-height: 1.2; font-weight: 700; }
.voyzuPrintreportHeaderLine { margin-top: 4px; font-size: 13px; line-height: 1.35; font-weight: 400; color: var(--text-muted); }
.voyzuPrintreportHeaderLineStrong { font-weight: 700; color: var(--text-main); }
.voyzuPrintdocumentTypeLine { font-size: 26px; color: #4b5563; }
.voyzuPrintdocumentDateLine { color: #000; }
.voyzuPrintreportSection { margin: 0; }
.voyzuPrintreportFooter { margin-top: 20px; padding-top: 8px; border-top: 1px solid var(--line-mid); font-size: 11px; color: var(--text-muted); text-align: right; }
.voyzuPrintgrid12 { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 16px; }
.voyzuPrintrowBordered { padding-bottom: 18px; border-bottom: 1px solid var(--line-mid); }
.voyzuPrintaddressBlock { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.voyzuPrintlabel { margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--text-muted); }
.voyzuPrintname { margin: 0; font-size: 14px; line-height: 1.35; font-weight: 700; }
.voyzuPrintline { margin: 0; color: var(--text-muted); font-size: 12px; line-height: 1.35; }
.voyzuPrintmetaRow { padding: 16px 0 18px; border-bottom: 1px solid var(--line-mid); row-gap: 12px; }
.voyzuPrintmetaSlot { grid-column: span 3; min-width: 0; }
.voyzuPrintmetaValue { margin: 4px 0 0; font-size: 13px; line-height: 1.35; font-weight: 700; overflow-wrap: anywhere; }
.voyzuPrintsection { margin-top: 18px; padding: 16px 18px; background: #f4f5f7; border: 1px solid var(--line-mid); border-radius: 6px; }
.voyzuPrintsectionTitle { margin: 0 0 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.voyzuPrinttable { width: 100%; border-collapse: collapse; font-size: 12px; }
.voyzuPrinttable th { padding: 0 8px 8px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--line-mid); }
.voyzuPrinttable th.voyzuPrintnumber { text-align: right; }
.voyzuPrinttable td { padding: 8px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
.voyzuPrinttable th:first-child, .voyzuPrinttable td:first-child { padding-left: 0; }
.voyzuPrinttable th:last-child, .voyzuPrinttable td:last-child { padding-right: 0; }
.voyzuPrintnumber { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.voyzuPrintcode { font-weight: 700; overflow-wrap: anywhere; }
.voyzuPrintdocumentLink { color: #0057d9; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.voyzuPrintmuted { color: var(--text-muted); }
.voyzuPrintvariance { font-weight: 700; }
.voyzuPrintnotes { margin: 0; white-space: pre-wrap; }
@media print {
  .voyzuPrintreportFooter { display: none; }
  .voyzuPrintsection { background: #f4f5f7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-inside: avoid; }
}
`;

export const printableDocumentStyles = {
  addressBlock: "voyzuPrintaddressBlock",
  code: "voyzuPrintcode",
  documentTypeLine: "voyzuPrintdocumentTypeLine",
  documentDateLine: "voyzuPrintdocumentDateLine",
  documentLink: "voyzuPrintdocumentLink",
  grid12: "voyzuPrintgrid12",
  label: "voyzuPrintlabel",
  line: "voyzuPrintline",
  metaRow: "voyzuPrintmetaRow",
  metaSlot: "voyzuPrintmetaSlot",
  metaValue: "voyzuPrintmetaValue",
  muted: "voyzuPrintmuted",
  name: "voyzuPrintname",
  notes: "voyzuPrintnotes",
  number: "voyzuPrintnumber",
  reportCompanyName: "voyzuPrintreportCompanyName",
  reportFooter: "voyzuPrintreportFooter",
  reportHeader: "voyzuPrintreportHeader",
  reportHeaderLine: "voyzuPrintreportHeaderLine",
  reportHeaderLineStrong: "voyzuPrintreportHeaderLineStrong",
  reportPage: "voyzuPrintreportPage",
  reportSection: "voyzuPrintreportSection",
  rowBordered: "voyzuPrintrowBordered",
  section: "voyzuPrintsection",
  sectionTitle: "voyzuPrintsectionTitle",
  table: "voyzuPrinttable",
  variance: "voyzuPrintvariance",
} as const;
