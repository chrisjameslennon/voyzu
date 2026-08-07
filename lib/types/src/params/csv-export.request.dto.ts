export interface CsvExportColumnDto {
  /** Source field key to read from each row. */
  key: string;

  /** Column heading to write in the CSV file. */
  label: string;
}

export interface CsvExportRequestDto {
  /** Download filename without extension. */
  filename: string;

  /** CSV columns to include in output order. */
  columns: CsvExportColumnDto[];

  /** Rows to write to the CSV file. */
  rows: Record<string, unknown>[];
}
