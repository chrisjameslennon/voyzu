export const printableReportCss = `
.printableReportDocument {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  color: #1f2937;
  font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 11px;
  line-height: 1.4;
}

.printableReportHeader {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1.5px solid #374151;
}

.printableReportHeader h1 {
  margin: 0;
  color: #111827;
  font-size: 26px;
  line-height: 1.2;
}

.printableReportHeader p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 10px;
}

.printableReportTable {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  background: #fff;
}

.printableReportTable th,
.printableReportTable td {
  padding: 7px 9px;
  border-bottom: 1px solid #d1d5db;
  text-align: left;
  vertical-align: top;
}

.printableReportTable th {
  background: #e5e7eb;
  color: #374151;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.printableReportTable tbody tr:nth-child(even) {
  background: #f9fafb;
}

.printableReportDetailRow td {
  padding-top: 4px;
  padding-bottom: 4px;
  border-bottom-color: #94a3b8;
  background: #fafafa;
}

.printableReportDetailLines {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px 18px;
}

.printableReportDetailLine {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 7px;
  align-items: baseline;
}

.printableReportDetailLine span {
  color: #64748b;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.printableReportDetailLine strong {
  font-weight: 400;
}

.printableReportTable .printableReportNumeric {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.printableReportTable .printableReportCode,
.printableReportTable .printableReportStatus {
  white-space: nowrap;
}

.printableReportEmpty {
  padding: 36px 12px;
  color: #6b7280;
  text-align: center;
}

.printableReportFooter {
  margin-top: 18px;
  padding-top: 8px;
  border-top: 1px solid #d1d5db;
  color: #6b7280;
  font-size: 10px;
  text-align: right;
}

.printableReportInactiveRow { color: #6b7280; }

@media print {
  @page {
    size: A4 landscape;
    margin: 12mm;
  }

  .printableReportDocument {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .printableReportTable thead {
    display: table-header-group;
  }

  .printableReportTable tr {
    break-inside: avoid;
  }
}
`;

export const printableReportStyles = {
  document: "printableReportDocument",
  header: "printableReportHeader",
  table: "printableReportTable",
  numeric: "printableReportNumeric",
  code: "printableReportCode",
  status: "printableReportStatus",
  inactiveRow: "printableReportInactiveRow",
  detailRow: "printableReportDetailRow",
  detailLines: "printableReportDetailLines",
  detailLine: "printableReportDetailLine",
  empty: "printableReportEmpty",
  footer: "printableReportFooter",
} as const;
