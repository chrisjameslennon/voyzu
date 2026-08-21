import {
  handleAccessArchivedCompany,
  handleGetCompanySelection,
  handleSetCompanySelection,
} from "@voyzu/organization/company-switcher/server";
import { EntityNotFoundErrorResponseDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { CompanySelectionUpdateResponseDto } from "../../types/modules/company-switcher/company-selection.update.response.dto";
import { CompanySelectionUpdateRequestDto } from "./types/company-selection.update.request.dto";
import { CompanySelectionResponseDto } from "../../types/modules/company-switcher/company-selection.response.dto";



export const apiDefinitions = {
  getSelection: {
    method: "GET",
    path: "/company-selection",
    handler: (request: any) => handleGetCompanySelection(request),
    summary: "Get Selection",
    description: "Get Selection Company Switcher.",
    tags: ["Company Switcher"],
    requestCookies: {
      voyzuSelectedCompanyId: {
        description: "Selected company cookie used to resolve the current company selection.",
        example: "10001",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAgeSeconds: 31536000,
      },
    },
    responses: { "200": { description: "Current company selection and selectable companies.", body: CompanySelectionResponseDto }, "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto } }
  },
  setSelection: {
    method: "PUT",
    path: "/company-selection",
    handler: (request: any) => handleSetCompanySelection(request),
    request: { contentType: "application/json", body: CompanySelectionUpdateRequestDto },
    summary: "Set Selection",
    description: "Set Selection Company Switcher.",
    tags: ["Company Switcher"],
    responses: {
      "200": {
        description: "The selected company id.",
        body: CompanySelectionUpdateResponseDto,
        cookies: {
          voyzuSelectedCompanyId: {
            description: "Selected company cookie used by company-scoped UI requests.",
            action: "set",
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAgeSeconds: 31536000,
          },
        },
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  accessArchivedSelection: {
    method: "POST",
    path: "/company-selection/archived",
    handler: (request: any) => handleAccessArchivedCompany(request),
    request: { contentType: "application/json", body: CompanySelectionUpdateRequestDto },
    summary: "Access Archived Company",
    description: "Select an accessible archived company without adding it to the active company switcher.",
    tags: ["Company Switcher"],
    responses: {
      "200": {
        description: "The selected archived company id.",
        body: CompanySelectionUpdateResponseDto,
        cookies: {
          voyzuSelectedCompanyId: {
            description: "Selected company cookie used by company-scoped UI requests.",
            action: "set",
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAgeSeconds: 31536000,
          },
        },
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
} as const;
