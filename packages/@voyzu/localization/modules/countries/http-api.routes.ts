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

export const httpApiRoutes = {
  "localization.countries.list": {
    method: "GET",
    path: "/localization/countries",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleList),
    summary: "List",
    
    
    responses: {
      "200": { description: "A list of all countries.", body: Type.Array(CountryResponseDto) },
      ...commonResponses,
    }
  },
  "localization.countries.create": {
    method: "POST",
    path: "/localization/countries",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleCreate),
    request: { contentType: "application/json", body: CountryCreateRequestDto },
    summary: "Create",
    
    
    responses: {
      "201": { description: "The created country.", body: CountryResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "A country with this code already exists.", body: ConflictErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.filter": {
    method: "POST",
    path: "/localization/countries/filter",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleFilter),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter",
    
    
    responses: {
      "200": { description: "A filtered list of countries.", body: Type.Array(CountryResponseDto) },
      ...commonResponses,
    }
  },
  "localization.countries.search": {
    method: "GET",
    path: "/localization/countries/search",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleSearch),
    request: { query: { parameters: { q: { description: "Search text used to match country records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search",
    
    
    responses: {
      "200": { description: "A list of matching countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchCreate": {
    method: "POST",
    path: "/localization/countries/batch/create",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchCreate),
    request: { contentType: "application/json", body: Type.Array(CountryCreateRequestDto) },
    summary: "Batch Create",
    
    
    responses: {
      "201": { description: "The created countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more country codes already exist.", body: ConflictErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchGet": {
    method: "POST",
    path: "/localization/countries/batch/get",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchGet),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Get",
    
    
    responses: {
      "200": { description: "The requested countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchUpdate": {
    method: "PUT",
    path: "/localization/countries/batch/update",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchUpdate),
    request: { contentType: "application/json", body: Type.Array(CountryBatchUpdateRequestDto) },
    summary: "Batch Update",
    
    
    responses: {
      "200": { description: "The updated countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchPatch": {
    method: "PATCH",
    path: "/localization/countries/batch/patch",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchPatch),
    request: { contentType: "application/json", body: Type.Array(CountryBatchPatchRequestDto) },
    summary: "Batch Patch",
    
    
    responses: {
      "200": { description: "The patched countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchDelete": {
    method: "POST",
    path: "/localization/countries/batch/delete",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchDelete),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Delete",
    
    
    responses: {
      "204": { description: "The countries were deleted." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "One or more countries have postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchActivate": {
    method: "POST",
    path: "/localization/countries/batch/activate",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchActivate),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Activate",
    
    
    responses: {
      "200": { description: "The activated countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.batchDeactivate": {
    method: "POST",
    path: "/localization/countries/batch/deactivate",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleBatchDeactivate),
    request: { contentType: "application/json", body: CountryCodesRequestDto },
    summary: "Batch Deactivate",
    
    
    responses: {
      "200": { description: "The deactivated countries.", body: Type.Array(CountryResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more countries were not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.get": {
    method: "GET",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleGet),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Get",
    
    
    responses: {
      "200": { description: "The requested country.", body: CountryResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.update": {
    method: "PUT",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleUpdate),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } }, contentType: "application/json", body: CountryUpdateRequestDto },
    summary: "Update",
    
    
    responses: {
      "200": { description: "The updated country.", body: CountryResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.patch": {
    method: "PATCH",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handlePatch),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } }, contentType: "application/json", body: CountryPatchRequestDto },
    summary: "Patch",
    
    
    responses: {
      "200": { description: "The patched country.", body: CountryResponseDto },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.delete": {
    method: "DELETE",
    path: "/localization/countries/[code]",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleDelete),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Delete",
    
    
    responses: {
      "204": { description: "The country was deleted." },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "Country has postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.activate": {
    method: "POST",
    path: "/localization/countries/[code]/activate",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleActivate),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Activate",
    
    
    responses: {
      "200": { description: "The activated country.", body: CountryResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
  "localization.countries.deactivate": {
    method: "POST",
    path: "/localization/countries/[code]/deactivate",
    loadHandler: () => import("./server/http-api/country.http.handlers").then((module) => module.handleDeactivate),
    request: { path: { code: { description: "Country code.", schema: { type: "string" } } } },
    summary: "Deactivate",
    
    
    responses: {
      "200": { description: "The deactivated country.", body: CountryResponseDto },
      "404": { description: "Country was not found.", body: EntityNotFoundErrorResponseDto },
      ...commonResponses,
    }
  },
} as const;
