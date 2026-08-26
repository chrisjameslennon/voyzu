import Type from "typebox";
import { BusinessRuleErrorResponseDto, ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { CountryResponseDto } from "../../types/modules/countries/country.response.dto";
import { CountryPatchRequestDto } from "../../types/modules/countries/country.patch.request.dto";
import { CountryUpdateRequestDto } from "../../types/modules/countries/country.update.request.dto";
import { CountryCodesRequestDto } from "../../types/modules/countries/country.codes.request.dto";
import { CountryBatchPatchRequestDto } from "../../types/modules/countries/country.batch-patch.request.dto";
import { CountryBatchUpdateRequestDto } from "../../types/modules/countries/country.batch-update.request.dto";
import { CountryCreateRequestDto } from "../../types/modules/countries/country.create.request.dto";

const commonResponses = {
  "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto },
} as const;

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/localization/countries",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleList),
    summary: "List",
    description: "Lists countries.",
    tags: ["Countries"],
    responses: {
      "200": { description: "A list of all countries.", body: Type.Array(CountryResponseDto) },
      ...commonResponses,
    }
  },
  create: {
    method: "POST",
    path: "/localization/countries",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleCreate),
    request: { contentType: "application/json", body: CountryCreateRequestDto },
    summary: "Create",
    description: "Creates a country. Status defaults to ACTIVE and cannot be supplied in the request body.",
    tags: ["Countries"],
    responses: {
      "201": { description: "The created country.", body: CountryResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "A country with this code already exists.", body: ConflictErrorResponseDto },
      ...commonResponses,
    }
  },
  filter: {
    method: "POST",
    path: "/localization/countries/filter",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleFilter),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter",
    description: "Filters countries using the shared filter request body.",
    tags: ["Countries"],
    responses: {
      "200": { description: "A filtered list of countries.", body: Type.Array(CountryResponseDto) },
      ...commonResponses,
    }
  },
  search: {
    method: "GET",
    path: "/localization/countries/search",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleSearch),
    request: { query: { parameters: { q: { description: "Search text used to match country records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search",
    description: "Searches countries.",
    tags: ["Countries"],
    responses: {
      "200": { description: "A list of matching countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      ...commonResponses,
    }
  },
  batchCreate: {
    method: "POST",
    path: "/localization/countries/batch/create",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchCreate),
    request: { contentType: "application/json", body: Type.Array(CountryCreateRequestDto) },
    summary: "Batch Create",
    description: "Creates multiple countries. Status defaults to ACTIVE and cannot be supplied in the request body.",
    tags: ["Countries"],
    responses: {
      "201": { description: "The created countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more country codes already exist.", body: ConflictErrorResponseDto },
      ...commonResponses,
    }
  },
  batchGet: {
    method: "POST",
    path: "/localization/countries/batch/get",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchGet),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Get",
    description: "Gets multiple countries by code.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The requested countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      ...commonResponses,
    }
  },
  batchUpdate: {
    method: "PUT",
    path: "/localization/countries/batch/update",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchUpdate),
    request: { contentType: "application/json", body: Type.Array(CountryBatchUpdateRequestDto) },
    summary: "Batch Update",
    description: "Updates multiple countries. Status cannot be changed by this request; code identifies each row.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The updated countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  batchPatch: {
    method: "PATCH",
    path: "/localization/countries/batch/patch",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchPatch),
    request: { contentType: "application/json", body: Type.Array(CountryBatchPatchRequestDto) },
    summary: "Batch Patch",
    description: "Patches multiple countries. Status cannot be changed by this request; code identifies each row.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The patched countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  batchDelete: {
    method: "POST",
    path: "/localization/countries/batch/delete",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchDelete),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Delete",
    description: "Deletes multiple countries. Countries with postings cannot be deleted.",
    tags: ["Countries"],
    responses: {
      "204": { description: "The countries were deleted." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "One or more countries have postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      ...commonResponses,
    }
  },
  batchActivate: {
    method: "POST",
    path: "/localization/countries/batch/activate",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchActivate),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Activate",
    description: "Sets multiple countries to ACTIVE.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The activated countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  batchDeactivate: {
    method: "POST",
    path: "/localization/countries/batch/deactivate",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleBatchDeactivate),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Deactivate",
    description: "Sets multiple countries to INACTIVE.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The deactivated countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  get: {
    method: "GET",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleGet),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Get",
    description: "Gets a country.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The requested country.", body: CountryResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  update: {
    method: "PUT",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleUpdate),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } }, contentType: "application/json", body: CountryUpdateRequestDto },
    summary: "Update",
    description: "Updates a country. Status and code cannot be changed by this request.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The updated country.", body: CountryResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  patch: {
    method: "PATCH",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handlePatch),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } }, contentType: "application/json", body: CountryPatchRequestDto },
    summary: "Patch",
    description: "Patches a country. Status and code cannot be changed by this request.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The patched country.", body: CountryResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  delete: {
    method: "DELETE",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleDelete),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Delete",
    description: "Deletes a country. Countries with postings cannot be deleted.",
    tags: ["Countries"],
    responses: {
      "204": { description: "The country was deleted." },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "Country has postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      ...commonResponses,
    }
  },
  activate: {
    method: "POST",
    path: "/localization/countries/[code]/activate",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleActivate),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Activate",
    description: "Sets a country to ACTIVE.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The activated country.", body: CountryResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  deactivate: {
    method: "POST",
    path: "/localization/countries/[code]/deactivate",
    loadHandler: () => import("./server/api/country.http.handlers").then((module) => module.handleDeactivate),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Deactivate",
    description: "Sets a country to INACTIVE.",
    tags: ["Countries"],
    responses: {
      "200": { description: "The deactivated country.", body: CountryResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
} as const;
