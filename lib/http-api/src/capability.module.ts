import Type from "typebox";
import {
  CsvExportRequestDto,
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types";

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

const capabilityModule = {
  httpApiRoutes: {
    "voyzu.capability.pdf": {
      description: "Renders a printable application route as a PDF download.",
      method: "GET",
      path: "/capability/pdf",
      loadHandler: () => import("./voyzu.pdf.handlers").then(
        (module) => (request: any) => module.handleGenericPdf(request, "attachment"),
      ),
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
    "voyzu.capability.pdfView": {
      description: "Renders a printable application route as an inline PDF.",
      method: "GET",
      path: "/capability/pdf-view",
      loadHandler: () => import("./voyzu.pdf.handlers").then(
        (module) => (request: any) => module.handleGenericPdf(request, "inline"),
      ),
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
    "voyzu.capability.export": {
      description: "Exports supplied tabular rows to a downloadable file.",
      method: "POST",
      path: "/capability/export",
      loadHandler: () => import("@voyzu/capability/export").then(
        (module) => module.handleExport,
      ),
      request: {
        contentType: "application/json",
        body: CsvExportRequestDto,
      },
      summary: "Export Rows",
      
      
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

export const capabilityHttpApiRegistration = { packageName: "@voyzu/http-api", routing: { roots: ["/capability"], routes: capabilityModule.httpApiRoutes }, documentation: {
  "sections": {
    "voyzu.capability": {
      "title": "Platform",
      "navigationHeadingId": "voyzu.platform",
      "description": "Core Voyzu platform operations.",
      "groups": {
        "voyzu.capability": {
          "title": "@voyzu/http-api",
          "description": "Generate PDF documents and export tabular data.",
          "routes": [
            "voyzu.capability.pdf",
            "voyzu.capability.pdfView",
            "voyzu.capability.export"
          ]
        }
      }
    }
  }
} } as const;
