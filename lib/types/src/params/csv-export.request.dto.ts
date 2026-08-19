import Type from "typebox";
import { StrictObject } from "../api";

export const CsvExportColumnDto = StrictObject({
  key: Type.String({ pattern: "\\S", description: "Non-blank source field key to read from each row." }),
  label: Type.String({ pattern: "\\S", description: "Non-blank column heading to write in the CSV file." }),
});
export type CsvExportColumnDto = Type.Static<typeof CsvExportColumnDto>;

export const CsvExportRequestDto = StrictObject({
  filename: Type.String({ pattern: "\\S", description: "Non-blank download filename without extension." }),
  columns: Type.Array(CsvExportColumnDto, { minItems: 1, description: "CSV columns to include in output order." }),
  rows: Type.Array(Type.Record(Type.String(), Type.Unknown()), { description: "Rows to write to the CSV file." }),
});
export type CsvExportRequestDto = Type.Static<typeof CsvExportRequestDto>;
