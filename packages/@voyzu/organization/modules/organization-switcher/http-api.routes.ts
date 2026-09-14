import { EntityNotFoundErrorResponseDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { OrganizationSelectionUpdateResponseDto } from "../../types/modules/organization-switcher/organization-selection.update.response.dto";
import { OrganizationSelectionUpdateRequestDto } from "./types/organization-selection.update.request.dto";
import { OrganizationSelectionResponseDto } from "../../types/modules/organization-switcher/organization-selection.response.dto";

const loadHandlers = () => import("./server/organization-selection.http.handlers");

export const httpApiRoutes = {
  "organization.organization-switcher.getSelection": {
    method: "GET",
    path: "/organization-selection",
    loadHandler: () => loadHandlers().then((module) => module.handleGetOrganizationSelection),
    summary: "Get Selection",
    
    
    
    responses: { "200": { description: "Current organization selection and selectable organizations.", body: OrganizationSelectionResponseDto }, "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto } }
  },
  "organization.organization-switcher.setSelection": {
    method: "PUT",
    path: "/organization-selection",
    loadHandler: () => loadHandlers().then((module) => module.handleSetOrganizationSelection),
    request: { contentType: "application/json", body: OrganizationSelectionUpdateRequestDto },
    summary: "Set Selection",
    
    
    responses: {
      "200": {
        description: "The selected organization id.",
        body: OrganizationSelectionUpdateResponseDto,
        cookies: ["voyzuSelectedOrganizationId"],
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organization-switcher.accessArchivedSelection": {
    method: "POST",
    path: "/organization-selection/archived",
    loadHandler: () => loadHandlers().then((module) => module.handleAccessArchivedOrganization),
    request: { contentType: "application/json", body: OrganizationSelectionUpdateRequestDto },
    summary: "Access Archived Organization",
    
    
    responses: {
      "200": {
        description: "The selected archived organization id.",
        body: OrganizationSelectionUpdateResponseDto,
        cookies: ["voyzuSelectedOrganizationId"],
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
} as const;
