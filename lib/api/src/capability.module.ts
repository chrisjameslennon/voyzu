import Type from "typebox";
import {
  CsvExportRequestDto,
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types";
import { handleGenericPdf } from "./voyzu.pdf.handlers";
import { handleExport } from "@voyzu/capability/export";

const commonResponses = {
  "400": {
    description: "Validation failed.",
    body: InputValidationErrorResponseDto,
  },
  "401": {
    description: "Authentication failed.",
    body: UnauthorizedErrorResponseDto,
  },
  "403": {
    description: "Access is forbidden.",
    body: ForbiddenErrorResponseDto,
  },
  "500": {
    description: "An unexpected server error occurred.",
    body: InternalServerErrorResponseDto,
  },
} as const;

export const capabilityModule = {
  apiDefinitions: {
    pdf: {
      method: "GET",
      path: "/capability/pdf",
      handler: (request: any) => handleGenericPdf(request, "attachment"),
      request: {
        query: {
          parameters: {
            path: {
              description: "Application path to render as a PDF.",
              required: true,
            },
          },
          schema: Type.Object({ path: Type.String({ pattern: "^/(?!/)" }) }),
        },
      },
      summary: "Generate PDF",
      description: "Renders a printable application route as a PDF download.",
      tags: ["Capability"],
      responses: {
        ...commonResponses,
        "200": {
          description: "Generated PDF.",
          contentType: "application/pdf",
        },
        "400": {
          description: "The printable path was not supplied.",
          body: InputValidationErrorResponseDto,
        },
        "502": { description: "The printable route failed." },
        "500": {
          description: "An unexpected server error occurred.",
          body: InternalServerErrorResponseDto,
        },
      },
    },
    pdfView: {
      method: "GET",
      path: "/capability/pdf-view",
      handler: (request: any) => handleGenericPdf(request, "inline"),
      request: {
        query: {
          parameters: {
            path: {
              description: "Application path to render as a PDF.",
              required: true,
            },
          },
          schema: Type.Object({ path: Type.String({ pattern: "^/(?!/)" }) }),
        },
      },
      summary: "View PDF",
      description: "Renders a printable application route as an inline PDF.",
      tags: ["Capability"],
      responses: {
        ...commonResponses,
        "200": {
          description: "Generated PDF.",
          contentType: "application/pdf",
        },
        "400": {
          description: "The printable path was not supplied.",
          body: InputValidationErrorResponseDto,
        },
        "502": { description: "The printable route failed." },
        "500": {
          description: "An unexpected server error occurred.",
          body: InternalServerErrorResponseDto,
        },
      },
    },
    export: {
      method: "POST",
      path: "/capability/export",
      handler: (request: any) => handleExport(request),
      request: {
        contentType: "application/json",
        body: CsvExportRequestDto,
      },
      summary: "Export Rows",
      description: "Exports supplied tabular rows to a downloadable file.",
      tags: ["Capability"],
      responses: {
        ...commonResponses,
        "200": {
          description: "Generated export file.",
          contentType: "text/csv",
        },
        "500": {
          description: "An unexpected server error occurred.",
          body: InternalServerErrorResponseDto,
        },
      },
    },
  },
} as const;
