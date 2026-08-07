import { handleGenericPdf } from "./voyzu.pdf.handlers";
import { handleExport } from "@voyzu/capability/export";
import { dtoRef } from "@voyzu/types/api";

export const capabilityModule = {
  apiDefinitions: {
    pdf: {
      method: "GET",
      path: "/capability/pdf",
      handler: (request: any) => handleGenericPdf(request, "attachment"),
      apiDoc: {
        summary: "Generate PDF",
        description: "Renders a printable application route as a PDF download.",
        tags: ["Capability"],
        responses: {
          "200": { description: "Generated PDF.", contentType: "application/pdf" },
          "400": {
            description: "The printable path was not supplied.",
            schema: dtoRef("InputValidationErrorResponseDto"),
          },
          "502": { description: "The printable route failed." },
          "500": {
            description: "An unexpected server error occurred.",
            schema: dtoRef("InternalServerErrorResponseDto"),
          },
        },
      },
    },
    pdfView: {
      method: "GET",
      path: "/capability/pdf-view",
      handler: (request: any) => handleGenericPdf(request, "inline"),
      apiDoc: {
        summary: "View PDF",
        description: "Renders a printable application route as an inline PDF.",
        tags: ["Capability"],
        responses: {
          "200": { description: "Generated PDF.", contentType: "application/pdf" },
          "400": {
            description: "The printable path was not supplied.",
            schema: dtoRef("InputValidationErrorResponseDto"),
          },
          "502": { description: "The printable route failed." },
          "500": {
            description: "An unexpected server error occurred.",
            schema: dtoRef("InternalServerErrorResponseDto"),
          },
        },
      },
    },
    export: {
      method: "POST",
      path: "/capability/export",
      handler: (request: any) => handleExport(request),
      apiDoc: {
        summary: "Export Rows",
        description: "Exports supplied tabular rows to a downloadable file.",
        tags: ["Capability"],
        requestBody: { required: true, schema: dtoRef("CsvExportRequestDto") },
        responses: {
          "200": { description: "Generated export file.", contentType: "application/octet-stream" },
          "500": {
            description: "An unexpected server error occurred.",
            schema: dtoRef("InternalServerErrorResponseDto"),
          },
        },
      },
    },
  },
} as const;
