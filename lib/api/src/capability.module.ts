import { handleGenericPdf } from "./voyzu.pdf.handlers";
import { handleExport } from "@voyzu/capability/export";
import { dtoRef } from "@voyzu/types/api";

const commonResponses = {
  "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") },
  "401": { description: "Authentication failed." },
  "403": { description: "Access is forbidden." },
  "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
} as const;

export const capabilityModule = {
  apiDefinitions: {
    pdf: {
      method: "GET",
      path: "/capability/pdf",
      handler: (request: any) => handleGenericPdf(request, "attachment"),
      request: {
        query: {
          path: {
            description: "Application path to render as a PDF.",
            required: true,
            schema: { type: "string" },
          },
        },
      },
      summary: "Generate PDF",
      description: "Renders a printable application route as a PDF download.",
      tags: ["Capability"],
      responses: {
        ...commonResponses,
        "200": { description: "Generated PDF.", contentType: "application/pdf" },
        "400": {
          description: "The printable path was not supplied.",
          body: dtoRef("InputValidationErrorResponseDto"),
        },
        "502": { description: "The printable route failed." },
        "500": {
          description: "An unexpected server error occurred.",
          body: dtoRef("InternalServerErrorResponseDto"),
        },
      }
    },
    pdfView: {
      method: "GET",
      path: "/capability/pdf-view",
      handler: (request: any) => handleGenericPdf(request, "inline"),
      request: {
        query: {
          path: {
            description: "Application path to render as a PDF.",
            required: true,
            schema: { type: "string" },
          },
        },
      },
      summary: "View PDF",
      description: "Renders a printable application route as an inline PDF.",
      tags: ["Capability"],
      responses: {
        ...commonResponses,
        "200": { description: "Generated PDF.", contentType: "application/pdf" },
        "400": {
          description: "The printable path was not supplied.",
          body: dtoRef("InputValidationErrorResponseDto"),
        },
        "502": { description: "The printable route failed." },
        "500": {
          description: "An unexpected server error occurred.",
          body: dtoRef("InternalServerErrorResponseDto"),
        },
      }
    },
    export: {
      method: "POST",
      path: "/capability/export",
      handler: (request: any) => handleExport(request),
      request: { contentType: "application/json", body: dtoRef("CsvExportRequestDto") },
      summary: "Export Rows",
      description: "Exports supplied tabular rows to a downloadable file.",
      tags: ["Capability"],
      responses: {
        ...commonResponses,
        "200": { description: "Generated export file.", contentType: "text/csv" },
        "500": {
          description: "An unexpected server error occurred.",
          body: dtoRef("InternalServerErrorResponseDto"),
        },
      }
    },
  },
} as const;
