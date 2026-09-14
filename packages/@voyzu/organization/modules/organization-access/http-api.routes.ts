import {
  OrganizationAccessPageDto,
  OrganizationAccessUpdateRequestDto,
  OrganizationAccessUserDto,
} from "@voyzu/organization/types/modules/organization-access";
import {
  BusinessRuleErrorResponseDto,
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  EntityNotFoundErrorResponseDto,
} from "@voyzu/types";

const loadHandlers = () => import("./server/http-api/organization-access.http.handlers");

export const httpApiRoutes = {
  "organization.organization-access.list": {
    description: "Lists standard users, organizations and current organization assignments.",
    method: "GET",
    path: "/organization/organization-access",
    loadHandler: () => loadHandlers().then((module) => module.handleList),
    summary: "List organization access",
    
    
    responses: {
      "200": { description: "Organization access configuration.", body: OrganizationAccessPageDto },
      "403": { description: "Access is forbidden.", body: ForbiddenErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    },
  },
  "organization.organization-access.replace": {
    description: "Replaces all organization assignments for a standard user.",
    method: "PUT",
    path: "/organization/organization-access/[code]",
    loadHandler: () => loadHandlers().then((module) => module.handleReplace),
    request: {
      path: {
        code: {
          description: "User code.",
          schema: { type: "string" },
        },
      },
      contentType: "application/json",
      body: OrganizationAccessUpdateRequestDto,
    },
    summary: "Replace organization access",
    
    
    responses: {
      "200": { description: "Updated organization access.", body: OrganizationAccessUserDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "403": { description: "Access is forbidden.", body: ForbiddenErrorResponseDto },
      "404": { description: "User or organization not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "The assignment violates a business rule.", body: BusinessRuleErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    },
  },
} as const;
