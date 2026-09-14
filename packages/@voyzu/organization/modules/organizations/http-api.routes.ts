import Type from "typebox";
import { OrganizationFinanceChangesDto, OrganizationFinanceSchema } from "@voyzu/types/business-objects/organization-finance";
import { UnauthorizedErrorResponseDto, BusinessRuleErrorResponseDto } from "@voyzu/types/errors";
import { ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { OrganizationResponseDto } from "../../types/modules/organizations/organization.response.dto";
import { OrganizationPatchRequestDto } from "../../types/modules/organizations/organization.patch.request.dto";
import { OrganizationUpdateRequestDto } from "../../types/modules/organizations/organization.update.request.dto";
import { OrganizationCodesRequestDto } from "../../types/modules/organizations/organization.codes.request.dto";
import { OrganizationBatchPatchRequestDto } from "../../types/modules/organizations/organization.batch-patch.request.dto";
import { OrganizationBatchUpdateRequestDto } from "../../types/modules/organizations/organization.batch-update.request.dto";
import { OrganizationCreateRequestDto } from "../../types/modules/organizations/organization.create.request.dto";

const loadHandlers = () => import("./server/http-api/organization.http.handlers");

export const httpApiRoutes = {
  "organization.organizations.updateFinance": {
    method: "PUT", path: "/organization/organizations/[code]/finance",
    loadHandler: () => import("./server/http-api/organization-finance.http.handlers").then(module => module.handleUpdateFinance),
    request: { path: { code: { description: "Organization code.", schema: Type.String() } }, contentType: "application/json", body: OrganizationFinanceChangesDto },
    summary: "Update organization Finance settings",  
    responses: {
      "200": { description: "Updated Finance settings.", body: OrganizationFinanceSchema },
      "400": { description: "Invalid settings or archived organization.", body: Type.Union([InputValidationErrorResponseDto, BusinessRuleErrorResponseDto]) },
      "401": { description: "An active user is required.", body: UnauthorizedErrorResponseDto },
      "404": { description: "Organization or Finance provider not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "Unexpected error.", body: InternalServerErrorResponseDto },
    },
  },
  "organization.organizations.list": {
    method: "GET",
    path: "/organization/organizations",
    loadHandler: () => loadHandlers().then((module) => module.handleList),
    summary: "List organizations",
    
    
    responses: {
      "200": { description: "A list of all organizations.", body: Type.Array(OrganizationResponseDto) },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.create": {
    method: "POST",
    path: "/organization/organizations",
    loadHandler: () => loadHandlers().then((module) => module.handleCreate),
    request: { contentType: "application/json", body: OrganizationCreateRequestDto },
    summary: "Create organization",
    
    
    responses: {
      "201": { description: "The created organization.", body: OrganizationResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "An organization with this code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.filter": {
    method: "POST",
    path: "/organization/organizations/filter",
    loadHandler: () => loadHandlers().then((module) => module.handleFilter),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter organizations",
    
    
    responses: {
      "200": { description: "A filtered list of organizations.", body: Type.Array(OrganizationResponseDto) },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.search": {
    method: "GET",
    path: "/organization/organizations/search",
    loadHandler: () => loadHandlers().then((module) => module.handleSearch),
    request: { query: { parameters: { q: { description: "Search text used to match organization records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search organizations",
    
    
    responses: {
      "200": { description: "Organizations matching the search query.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Query parameter q is missing or invalid.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchCreate": {
    method: "POST",
    path: "/organization/organizations/batch/create",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchCreate),
    request: { contentType: "application/json", body: Type.Array(OrganizationCreateRequestDto) },
    summary: "Batch create organizations",
    
    
    responses: {
      "201": { description: "The created organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchGet": {
    method: "POST",
    path: "/organization/organizations/batch/get",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchGet),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch get organizations",
    
    
    responses: {
      "200": { description: "The requested organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchUpdate": {
    method: "PUT",
    path: "/organization/organizations/batch/update",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchUpdate),
    request: { contentType: "application/json", body: Type.Array(OrganizationBatchUpdateRequestDto) },
    summary: "Batch update organizations",
    
    
    responses: {
      "200": { description: "The updated organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "One or more target codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchPatch": {
    method: "PATCH",
    path: "/organization/organizations/batch/patch",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchPatch),
    request: { contentType: "application/json", body: Type.Array(OrganizationBatchPatchRequestDto) },
    summary: "Batch patch organizations",
    
    
    responses: {
      "200": { description: "The patched organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "One or more target codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchDelete": {
    method: "POST",
    path: "/organization/organizations/batch/delete",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchDelete),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch delete organizations",
    
    
    responses: {
      "204": { description: "Organizations deleted successfully." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchActivate": {
    method: "POST",
    path: "/organization/organizations/batch/activate",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchActivate),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch activate organizations",
    
    
    responses: {
      "200": { description: "The activated organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.batchDeactivate": {
    method: "POST",
    path: "/organization/organizations/batch/deactivate",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchDeactivate),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch deactivate organizations",
    
    
    responses: {
      "200": { description: "The deactivated organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.activate": {
    method: "POST",
    path: "/organization/organizations/[code]/activate",
    loadHandler: () => loadHandlers().then((module) => module.handleActivate),
    request: {
      path: {
        code: {
          description: "Organization business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Activate organization",
    
    
    responses: {
      "200": { description: "The activated organization.", body: OrganizationResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.deactivate": {
    method: "POST",
    path: "/organization/organizations/[code]/deactivate",
    loadHandler: () => loadHandlers().then((module) => module.handleDeactivate),
    request: {
      path: {
        code: {
          description: "Organization business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Deactivate organization",
    
    
    responses: {
      "200": { description: "The deactivated organization.", body: OrganizationResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.get": {
    method: "GET",
    path: "/organization/organizations/[code]",
    loadHandler: () => loadHandlers().then((module) => module.handleGet),
    request: {
      path: {
        code: {
          description: "Organization business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Get organization",
    
    
    responses: {
      "200": { description: "The requested organization.", body: OrganizationResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.update": {
    method: "PUT",
    path: "/organization/organizations/[code]",
    loadHandler: () => loadHandlers().then((module) => module.handleUpdate),
    request: {
      path: {
        code: {
          description: "Organization business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: OrganizationUpdateRequestDto
    },
    summary: "Update organization",
    
    
    responses: {
      "200": { description: "The updated organization.", body: OrganizationResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "An organization with the target code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.patch": {
    method: "PATCH",
    path: "/organization/organizations/[code]",
    loadHandler: () => loadHandlers().then((module) => module.handlePatch),
    request: {
      path: {
        code: {
          description: "Organization business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: OrganizationPatchRequestDto
    },
    summary: "Patch organization",
    
    
    responses: {
      "200": { description: "The patched organization.", body: OrganizationResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "An organization with the target code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  "organization.organizations.delete": {
    method: "DELETE",
    path: "/organization/organizations/[code]",
    loadHandler: () => loadHandlers().then((module) => module.handleDelete),
    request: {
      path: {
        code: {
          description: "Organization business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Delete organization",
    
    
    responses: {
      "204": { description: "Organization deleted successfully." },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
} as const;
