import { NextResponse, type NextRequest } from "next/server";

import { renderHtmlToPdf } from "@voyzu/capability/pdf";

function safeFilename(raw: string | null): string {
  const stripped = (raw ?? "voyzu-report").replace(/\.pdf$/i, "");
  const cleaned = stripped.replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");
  return cleaned || "voyzu-report";
}

function buildPrintableUrl(request: NextRequest): URL {
  const sourceUrl = new URL(request.url);
  const printablePath = sourceUrl.searchParams.get("path");
  if (!printablePath || !printablePath.startsWith("/")) {
    throw new Error("path query parameter is required");
  }

  const printableUrl = new URL(printablePath, sourceUrl.origin);
  sourceUrl.searchParams.forEach((value, key) => {
    if (key !== "path" && key !== "filename" && key !== "orientation") {
      printableUrl.searchParams.set(key, value);
    }
  });
  return printableUrl;
}

export async function handleGenericPdf(
  request: NextRequest,
  disposition: "attachment" | "inline",
): Promise<NextResponse> {
  try {
    const sourceUrl = new URL(request.url);
    const printableUrl = buildPrintableUrl(request);
    const htmlResponse = await fetch(printableUrl, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (!htmlResponse.ok) {
      return NextResponse.json(
        {
          code: "PDF_SOURCE_ERROR",
          message: `Printable route returned ${htmlResponse.status}`,
        },
        { status: 502 },
      );
    }

    const html = await htmlResponse.text();
    const pdf = await renderHtmlToPdf({
      html,
      generatedAt: new Date().toISOString(),
      landscape: sourceUrl.searchParams.get("orientation") === "landscape",
    });
    const filename = safeFilename(sourceUrl.searchParams.get("filename"));

    return new NextResponse(pdf as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "path query parameter is required") {
      return NextResponse.json(
        {
          code: "INPUT_VALIDATION_ERROR",
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
