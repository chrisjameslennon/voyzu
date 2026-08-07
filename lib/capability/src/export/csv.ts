export interface CsvColumn {
  key: string;
  label: string;
}

function csvEscape(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(columns: CsvColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((column) => csvEscape(column.label)).join(",");
  const body = rows.map((row) => (
    columns.map((column) => csvEscape(row[column.key])).join(",")
  ));

  return [header, ...body].join("\n") + "\n";
}
