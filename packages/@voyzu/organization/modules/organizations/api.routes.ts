import Type from "typebox";
import { ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { OrganizationResponseDto } from "../../types/modules/organizations/organization.response.dto";
import { OrganizationPatchRequestDto } from "../../types/modules/organizations/organization.patch.request.dto";
import { OrganizationUpdateRequestDto } from "../../types/modules/organizations/organization.update.request.dto";
import { OrganizationCodesRequestDto } from "../../types/modules/organizations/organization.codes.request.dto";
import { OrganizationBatchPatchRequestDto } from "../../types/modules/organizations/organization.batch-patch.request.dto";
import { OrganizationBatchUpdateRequestDto } from "../../types/modules/organizations/organization.batch-update.request.dto";
import { OrganizationCreateRequestDto } from "../../types/modules/organizations/organization.create.request.dto";

const loadHandlers = () => import("./server/api/organization.http.handlers");

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/organization/organizations",
    loadHandler: () => loadHandlers().then((module) => module.handleList),
    summary: "List organizations",
    description: "Returns all organizations in the system.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "A list of all organizations.", body: Type.Array(OrganizationResponseDto) },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  create: {
    method: "POST",
    path: "/organization/organizations",
    loadHandler: () => loadHandlers().then((module) => module.handleCreate),
    request: { contentType: "application/json", body: OrganizationCreateRequestDto },
    summary: "Create organization",
    description: "Creates a new organization record. Status defaults to ACTIVE and cannot be supplied in the request body.",
    tags: ["Organizations"],
    responses: {
      "201": { description: "The created organization.", body: OrganizationResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "An organization with this code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  filter: {
    method: "POST",
    path: "/organization/organizations/filter",
    loadHandler: () => loadHandlers().then((module) => module.handleFilter),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter organizations",
    description: "Returns organizations matching the supplied filter criteria.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "A filtered list of organizations.", body: Type.Array(OrganizationResponseDto) },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  search: {
    method: "GET",
    path: "/organization/organizations/search",
    loadHandler: () => loadHandlers().then((module) => module.handleSearch),
    request: { query: { parameters: { q: { description: "Search text used to match organization records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search organizations",
    description: "Full-text search across organizations using the query string parameter.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "Organizations matching the search query.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Query parameter q is missing or invalid.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchCreate: {
    method: "POST",
    path: "/organization/organizations/batch/create",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchCreate),
    request: { contentType: "application/json", body: Type.Array(OrganizationCreateRequestDto) },
    summary: "Batch create organizations",
    description:
      "Creates multiple organization records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back.",
    tags: ["Organizations"],
    responses: {
      "201": { description: "The created organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchGet: {
    method: "POST",
    path: "/organization/organizations/batch/get",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchGet),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch get organizations",
    description: "Retrieves multiple organizations by a list of business codes.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The requested organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchUpdate: {
    method: "PUT",
    path: "/organization/organizations/batch/update",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchUpdate),
    request: { contentType: "application/json", body: Type.Array(OrganizationBatchUpdateRequestDto) },
    summary: "Batch update organizations",
    description:
      "Fully replaces multiple organization records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The updated organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "One or more target codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchPatch: {
    method: "PATCH",
    path: "/organization/organizations/batch/patch",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchPatch),
    request: { contentType: "application/json", body: Type.Array(OrganizationBatchPatchRequestDto) },
    summary: "Batch patch organizations",
    description:
      "Partially updates multiple organization records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The patched organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "One or more target codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchDelete: {
    method: "POST",
    path: "/organization/organizations/batch/delete",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchDelete),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch delete organizations",
    description: "Permanently deletes multiple organizations and all organization-owned financial records by their business codes.",
    tags: ["Organizations"],
    responses: {
      "204": { description: "Organizations deleted successfully." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchActivate: {
    method: "POST",
    path: "/organization/organizations/batch/activate",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchActivate),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch activate organizations",
    description: "Sets multiple organizations to ACTIVE.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The activated organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchDeactivate: {
    method: "POST",
    path: "/organization/organizations/batch/deactivate",
    loadHandler: () => loadHandlers().then((module) => module.handleBatchDeactivate),
    request: { contentType: "application/json", body: OrganizationCodesRequestDto },
    summary: "Batch deactivate organizations",
    description: "Sets multiple organizations to INACTIVE.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The deactivated organizations.", body: Type.Array(OrganizationResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more organizations not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  activate: {
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
    description: "Sets an organization to ACTIVE.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The activated organization.", body: OrganizationResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  deactivate: {
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
    description: "Sets an organization to INACTIVE.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The deactivated organization.", body: OrganizationResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  get: {
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
    description: "Retrieves a single organization by its business code.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The requested organization.", body: OrganizationResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  update: {
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
    description: "Fully replaces an organization record with the supplied data.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The updated organization.", body: OrganizationResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "An organization with the target code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  patch: {
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
    description: "Partially updates an organization record. Only the fields provided are changed.",
    tags: ["Organizations"],
    responses: {
      "200": { description: "The patched organization.", body: OrganizationResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "An organization with the target code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  delete: {
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
    description: "Permanently deletes an organization and all organization-owned financial records by its business code.",
    tags: ["Organizations"],
    responses: {
      "204": { description: "Organization deleted successfully." },
      "404": { description: "Organization not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
} as const;
