import { EntityNotFoundErrorResponseDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { OrganizationSelectionUpdateResponseDto } from "../../types/modules/organization-switcher/organization-selection.update.response.dto";
import { OrganizationSelectionUpdateRequestDto } from "./types/organization-selection.update.request.dto";
import { OrganizationSelectionResponseDto } from "../../types/modules/organization-switcher/organization-selection.response.dto";

const loadHandlers = () => import("./server/organization-selection.http.handlers");

export const apiDefinitions = {
  getSelection: {
    method: "GET",
    path: "/organization-selection",
    loadHandler: () => loadHandlers().then((module) => module.handleGetOrganizationSelection),
    summary: "Get Selection",
    description: "Get Selection Organization Switcher.",
    tags: ["Organization Switcher"],
    requestCookies: {
      voyzuSelectedOrganizationId: {
        description: "Selected organization cookie used to resolve the current organization selection.",
        example: "10001",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAgeSeconds: 31536000,
      },
    },
    responses: { "200": { description: "Current organization selection and selectable organizations.", body: OrganizationSelectionResponseDto }, "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto } }
  },
  setSelection: {
    method: "PUT",
    path: "/organization-selection",
    loadHandler: () => loadHandlers().then((module) => module.handleSetOrganizationSelection),
    request: { contentType: "application/json", body: OrganizationSelectionUpdateRequestDto },
    summary: "Set Selection",
    description: "Set Selection Organization Switcher.",
    tags: ["Organization Switcher"],
    responses: {
      "200": {
        description: "The selected organization id.",
        body: OrganizationSelectionUpdateResponseDto,
        cookies: {
          voyzuSelectedOrganizationId: {
            description: "Selected organization cookie used by organization-scoped UI requests.",
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
    path: "/organization-selection/archived",
    loadHandler: () => loadHandlers().then((module) => module.handleAccessArchivedOrganization),
    request: { contentType: "application/json", body: OrganizationSelectionUpdateRequestDto },
    summary: "Access Archived Organization",
    description: "Select an accessible archived organization without adding it to the active organization switcher.",
    tags: ["Organization Switcher"],
    responses: {
      "200": {
        description: "The selected archived organization id.",
        body: OrganizationSelectionUpdateResponseDto,
        cookies: {
          voyzuSelectedOrganizationId: {
            description: "Selected organization cookie used by organization-scoped UI requests.",
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
