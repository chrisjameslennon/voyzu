import { NextResponse, type NextRequest } from "next/server";
import type { CsvExportRequestDto } from "@voyzu/types/params";

import { toCsv } from "./csv";

function safeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_") || "export";
}

export async function handleExport(request: NextRequest): Promise<NextResponse> {
  const { filename, columns, rows } = await request.json() as CsvExportRequestDto;
  const csv = toCsv(columns, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(filename)}.csv"`,
    },
  });
}
