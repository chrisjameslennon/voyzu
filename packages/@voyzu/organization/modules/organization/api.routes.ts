import { handleGetOrganization, handleUpdateOrganization } from "@voyzu/organization/organization/server";
import { OrganizationPage } from "@voyzu/organization/organization/server";
import { BusinessRuleErrorResponseDto, EntityNotFoundErrorResponseDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { OrganizationResponseDto } from "../../types/modules/organization/organization.response.dto";
import { OrganizationUpdateRequestDto } from "../../types/modules/organization/organization.update.request.dto";



export const apiDefinitions = {
  get: {
    method: "GET",
    path: "/organization",
    handler: (request: any) => handleGetOrganization(request),
    summary: "Get",
    description: "Get",
    tags: ["Organization"],
    responses: {
      "200": { description: "Successful response.", body: OrganizationResponseDto }, "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto }
    }
  },
  update: {
    method: "PUT",
    path: "/organization",
    handler: (request: any) => handleUpdateOrganization(request),
    request: { contentType: "application/json", body: OrganizationUpdateRequestDto },
    summary: "Update",
    description: "Update",
    tags: ["Organization"],
    responses: {
      "200": { description: "Successful response.", body: OrganizationResponseDto }, "400": { description: "Invalid request body.", body: InputValidationErrorResponseDto }, "404": { description: "Organization was not found.", body: EntityNotFoundErrorResponseDto }, "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
      "422": { description: "Code cannot be changed if the organization has postings.", body: BusinessRuleErrorResponseDto }
    }
  },
} as const;
