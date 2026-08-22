import Type from "typebox";
import { handleActivate as handleCurrenciesActivate, handleBatchActivate as handleCurrenciesBatchActivate, handleBatchCreate as handleCurrenciesBatchCreate, handleBatchDeactivate as handleCurrenciesBatchDeactivate, handleBatchDelete as handleCurrenciesBatchDelete, handleBatchGet as handleCurrenciesBatchGet, handleBatchPatch as handleCurrenciesBatchPatch, handleBatchUpdate as handleCurrenciesBatchUpdate, handleCreate as handleCurrenciesCreate, handleDeactivate as handleCurrenciesDeactivate, handleDelete as handleCurrenciesDelete, handleFilter as handleCurrenciesFilter, handleGet as handleCurrenciesGet, handleList as handleCurrenciesList, handlePatch as handleCurrenciesPatch, handleSearch as handleCurrenciesSearch, handleUpdate as handleCurrenciesUpdate } from "@voyzu/localization/currencies/server";
import { CurrenciesListPage, CurrencyDetailPage } from "@voyzu/localization/currencies/server";
import { BusinessRuleErrorResponseDto, ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { CurrencyResponseDto } from "../../types/modules/currencies/currency.response.dto";
import { CurrencyCodesRequestDto } from "../../types/modules/currencies/currency.codes.request.dto";
import { CurrencyBatchPatchRequestDto } from "../../types/modules/currencies/currency.batch-patch.request.dto";
import { CurrencyBatchUpdateRequestDto } from "../../types/modules/currencies/currency.batch-update.request.dto";
import { CurrencyCreateRequestDto } from "../../types/modules/currencies/currency.create.request.dto";
import { CurrencyPatchRequestDto } from "../../types/modules/currencies/currency.patch.request.dto";
import { CurrencyUpdateRequestDto } from "../../types/modules/currencies/currency.update.request.dto";



export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/localization/currencies",
    handler: (request: any) => handleCurrenciesList(request),
    summary: "List",
    description: "List Currencies.",
    tags: ["Currencies"],
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(CurrencyResponseDto)
      },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  create: {
    method: "POST",
    path: "/localization/currencies",
    handler: (request: any) => handleCurrenciesCreate(request),
    request: { contentType: "application/json", body: CurrencyCreateRequestDto },
    summary: "Create",
    description: "Create Currencies. Status defaults to ACTIVE and cannot be supplied in the request body.",
    tags: ["Currencies"],
    responses: {
      "201": {
        description: "The created currency.",
        body: CurrencyResponseDto
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "422": { description: "Business rule failed.", body: BusinessRuleErrorResponseDto },
      "409": { description: "Conflict.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  filter: {
    method: "POST",
    path: "/localization/currencies/filter",
    handler: (request: any) => handleCurrenciesFilter(request),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter",
    description: "Filter Currencies.",
    tags: ["Currencies"],
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(CurrencyResponseDto)
      },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  search: {
    method: "GET",
    path: "/localization/currencies/search",
    handler: (request: any) => handleCurrenciesSearch(request),
    request: { query: { parameters: { q: { description: "Search text used to match currency records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search",
    description: "Search Currencies.",
    tags: ["Currencies"],
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(CurrencyResponseDto)
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  get: {
    method: "GET",
    path: "/localization/currencies/[code]",
    handler: (request: any, context: any) => handleCurrenciesGet(request, context),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Get",
    description: "Get Currencies.",
    tags: ["Currencies"],
    responses: {
      "200": {
        description: "Successful response.",
        body: CurrencyResponseDto
      },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  update: {
    method: "PUT",
    path: "/localization/currencies/[code]",
    handler: (request: any, context: any) => handleCurrenciesUpdate(request, context),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: CurrencyUpdateRequestDto
    },
    summary: "Update",
    description: "Update Currencies.",
    tags: ["Currencies"],
    responses: {
      "200": {
        description: "Successful response.",
        body: CurrencyResponseDto
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "422": { description: "Business rule failed.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  patch: {
    method: "PATCH",
    path: "/localization/currencies/[code]",
    handler: (request: any, context: any) => handleCurrenciesPatch(request, context),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: CurrencyPatchRequestDto
    },
    summary: "Patch",
    description: "Patch Currencies.",
    tags: ["Currencies"],
    responses: {
      "200": {
        description: "Successful response.",
        body: CurrencyResponseDto
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "422": { description: "Business rule failed.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  delete: {
    method: "DELETE",
    path: "/localization/currencies/[code]",
    handler: (request: any, context: any) => handleCurrenciesDelete(request, context),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Delete",
    description: "Delete Currencies.",
    tags: ["Currencies"],
    responses: {
      "204": { description: "Successful response." },
      "422": { description: "Currency has postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchCreate: {
    method: "POST",
    path: "/localization/currencies/batch/create",
    handler: (request: any) => handleCurrenciesBatchCreate(request),
    request: { contentType: "application/json", body: Type.Array(CurrencyCreateRequestDto) },
    summary: "Batch Create",
    description: "Creates multiple currencies. Status defaults to ACTIVE and cannot be supplied in the request body.",
    tags: ["Currencies"],
    responses: {
      "201": { description: "The created currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more currency codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchGet: {
    method: "POST",
    path: "/localization/currencies/batch/get",
    handler: (request: any) => handleCurrenciesBatchGet(request),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Get",
    description: "Gets multiple currencies by code.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "The requested currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchUpdate: {
    method: "PUT",
    path: "/localization/currencies/batch/update",
    handler: (request: any) => handleCurrenciesBatchUpdate(request),
    request: { contentType: "application/json", body: Type.Array(CurrencyBatchUpdateRequestDto) },
    summary: "Batch Update",
    description: "Updates multiple currencies. Status and code cannot be changed by this request; code identifies each row.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "The updated currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more currencies were not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchPatch: {
    method: "PATCH",
    path: "/localization/currencies/batch/patch",
    handler: (request: any) => handleCurrenciesBatchPatch(request),
    request: { contentType: "application/json", body: Type.Array(CurrencyBatchPatchRequestDto) },
    summary: "Batch Patch",
    description: "Patches multiple currencies. Status and code cannot be changed by this request; code identifies each row.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "The patched currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more currencies were not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchDelete: {
    method: "POST",
    path: "/localization/currencies/batch/delete",
    handler: (request: any) => handleCurrenciesBatchDelete(request),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Delete",
    description: "Deletes multiple currencies. Currencies with postings cannot be deleted.",
    tags: ["Currencies"],
    responses: {
      "204": { description: "The currencies were deleted." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more currencies were not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "One or more currencies have postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  activate: {
    method: "POST",
    path: "/localization/currencies/[code]/activate",
    handler: (request: any, context: any) => handleCurrenciesActivate(request, context),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Activate",
    description: "Sets a currency to ACTIVE.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "Successful response.", body: CurrencyResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  deactivate: {
    method: "POST",
    path: "/localization/currencies/[code]/deactivate",
    handler: (request: any, context: any) => handleCurrenciesDeactivate(request, context),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Deactivate",
    description: "Sets a currency to INACTIVE.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "Successful response.", body: CurrencyResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchActivate: {
    method: "POST",
    path: "/localization/currencies/batch/activate",
    handler: (request: any) => handleCurrenciesBatchActivate(request),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Activate",
    description: "Sets multiple currencies to ACTIVE.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "Successful response.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  batchDeactivate: {
    method: "POST",
    path: "/localization/currencies/batch/deactivate",
    handler: (request: any) => handleCurrenciesBatchDeactivate(request),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Deactivate",
    description: "Sets multiple currencies to INACTIVE.",
    tags: ["Currencies"],
    responses: {
      "200": { description: "Successful response.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
} as const;
