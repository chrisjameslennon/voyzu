import Type from "typebox";
import {
  handleBatchCreate,
  handleBatchActivate,
  handleBatchDeactivate,
  handleBatchDelete,
  handleBatchGet,
  handleBatchPatch,
  handleBatchUpdate,
  handleActivate,
  handleCreate,
  handleDeactivate,
  handleDelete,
  handleFilter,
  handleGet,
  handleList,
  handlePatch,
  handleSearch,
  handleUpdate,
} from "./server/api/company.http.handlers";
import { CompaniesListPage, CompanyDetailPage } from "@voyzu/organization/companies/server";
import { ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { CompanyResponseDto } from "../../types/modules/companies/company.response.dto";
import { CompanyPatchRequestDto } from "../../types/modules/companies/company.patch.request.dto";
import { CompanyUpdateRequestDto } from "../../types/modules/companies/company.update.request.dto";
import { CompanyCodesRequestDto } from "../../types/modules/companies/company.codes.request.dto";
import { CompanyBatchPatchRequestDto } from "../../types/modules/companies/company.batch-patch.request.dto";
import { CompanyBatchUpdateRequestDto } from "../../types/modules/companies/company.batch-update.request.dto";
import { CompanyCreateRequestDto } from "../../types/modules/companies/company.create.request.dto";



export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/organization/companies",
    handler: handleList,
    summary: "List companies",
    description: "Returns all companies in the system.",
    tags: ["Companies"],
    responses: {
      "200": { description: "A list of all companies.", body: Type.Array(CompanyResponseDto) },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  create: {
    method: "POST",
    path: "/organization/companies",
    handler: handleCreate,
    request: { contentType: "application/json", body: CompanyCreateRequestDto },
    summary: "Create company",
    description: "Creates a new company record. Status defaults to ACTIVE and cannot be supplied in the request body.",
    tags: ["Companies"],
    responses: {
      "201": { description: "The created company.", body: CompanyResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "A company with this code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  filter: {
    method: "POST",
    path: "/organization/companies/filter",
    handler: handleFilter,
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter companies",
    description: "Returns companies matching the supplied filter criteria.",
    tags: ["Companies"],
    responses: {
      "200": { description: "A filtered list of companies.", body: Type.Array(CompanyResponseDto) },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  search: {
    method: "GET",
    path: "/organization/companies/search",
    handler: handleSearch,
    request: { query: { parameters: { q: { description: "Search text used to match company records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search companies",
    description: "Full-text search across companies using the query string parameter.",
    tags: ["Companies"],
    responses: {
      "200": { description: "Companies matching the search query.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Query parameter q is missing or invalid.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchCreate: {
    method: "POST",
    path: "/organization/companies/batch/create",
    handler: handleBatchCreate,
    request: { contentType: "application/json", body: Type.Array(CompanyCreateRequestDto) },
    summary: "Batch create companies",
    description:
      "Creates multiple company records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back.",
    tags: ["Companies"],
    responses: {
      "201": { description: "The created companies.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchGet: {
    method: "POST",
    path: "/organization/companies/batch/get",
    handler: handleBatchGet,
    request: { contentType: "application/json", body: CompanyCodesRequestDto },
    summary: "Batch get companies",
    description: "Retrieves multiple companies by a list of business codes.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The requested companies.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchUpdate: {
    method: "PUT",
    path: "/organization/companies/batch/update",
    handler: handleBatchUpdate,
    request: { contentType: "application/json", body: Type.Array(CompanyBatchUpdateRequestDto) },
    summary: "Batch update companies",
    description:
      "Fully replaces multiple company records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The updated companies.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more companies not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "One or more target codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchPatch: {
    method: "PATCH",
    path: "/organization/companies/batch/patch",
    handler: handleBatchPatch,
    request: { contentType: "application/json", body: Type.Array(CompanyBatchPatchRequestDto) },
    summary: "Batch patch companies",
    description:
      "Partially updates multiple company records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The patched companies.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more companies not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "One or more target codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchDelete: {
    method: "POST",
    path: "/organization/companies/batch/delete",
    handler: handleBatchDelete,
    request: { contentType: "application/json", body: CompanyCodesRequestDto },
    summary: "Batch delete companies",
    description: "Permanently deletes multiple companies and all company-owned financial records by their business codes.",
    tags: ["Companies"],
    responses: {
      "204": { description: "Companies deleted successfully." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more companies not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchActivate: {
    method: "POST",
    path: "/organization/companies/batch/activate",
    handler: handleBatchActivate,
    request: { contentType: "application/json", body: CompanyCodesRequestDto },
    summary: "Batch activate companies",
    description: "Sets multiple companies to ACTIVE.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The activated companies.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more companies not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  batchDeactivate: {
    method: "POST",
    path: "/organization/companies/batch/deactivate",
    handler: handleBatchDeactivate,
    request: { contentType: "application/json", body: CompanyCodesRequestDto },
    summary: "Batch deactivate companies",
    description: "Sets multiple companies to INACTIVE.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The deactivated companies.", body: Type.Array(CompanyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more companies not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  activate: {
    method: "POST",
    path: "/organization/companies/[code]/activate",
    handler: handleActivate,
    request: {
      path: {
        code: {
          description: "Company business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Activate company",
    description: "Sets a company to ACTIVE.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The activated company.", body: CompanyResponseDto },
      "404": { description: "Company not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  deactivate: {
    method: "POST",
    path: "/organization/companies/[code]/deactivate",
    handler: handleDeactivate,
    request: {
      path: {
        code: {
          description: "Company business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Deactivate company",
    description: "Sets a company to INACTIVE.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The deactivated company.", body: CompanyResponseDto },
      "404": { description: "Company not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  get: {
    method: "GET",
    path: "/organization/companies/[code]",
    handler: handleGet,
    request: {
      path: {
        code: {
          description: "Company business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Get company",
    description: "Retrieves a single company by its business code.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The requested company.", body: CompanyResponseDto },
      "404": { description: "Company not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  update: {
    method: "PUT",
    path: "/organization/companies/[code]",
    handler: handleUpdate,
    request: {
      path: {
        code: {
          description: "Company business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: CompanyUpdateRequestDto
    },
    summary: "Update company",
    description: "Fully replaces a company record with the supplied data.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The updated company.", body: CompanyResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Company not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "A company with the target code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  patch: {
    method: "PATCH",
    path: "/organization/companies/[code]",
    handler: handlePatch,
    request: {
      path: {
        code: {
          description: "Company business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: CompanyPatchRequestDto
    },
    summary: "Patch company",
    description: "Partially updates a company record. Only the fields provided are changed.",
    tags: ["Companies"],
    responses: {
      "200": { description: "The patched company.", body: CompanyResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Company not found.", body: EntityNotFoundErrorResponseDto },
      "409": { description: "A company with the target code already exists.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
  delete: {
    method: "DELETE",
    path: "/organization/companies/[code]",
    handler: handleDelete,
    request: {
      path: {
        code: {
          description: "Company business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Delete company",
    description: "Permanently deletes a company and all company-owned financial records by its business code.",
    tags: ["Companies"],
    responses: {
      "204": { description: "Company deleted successfully." },
      "404": { description: "Company not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
    }
  },
} as const;
