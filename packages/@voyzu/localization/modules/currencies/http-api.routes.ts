import Type from "typebox";
import { BusinessRuleErrorResponseDto, ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { CurrencyResponseDto } from "../../types/modules/currencies/currency.response.dto";
import { CurrencyCodesRequestDto } from "../../types/modules/currencies/currency.codes.request.dto";
import { CurrencyBatchPatchRequestDto } from "../../types/modules/currencies/currency.batch-patch.request.dto";
import { CurrencyBatchUpdateRequestDto } from "../../types/modules/currencies/currency.batch-update.request.dto";
import { CurrencyCreateRequestDto } from "../../types/modules/currencies/currency.create.request.dto";
import { CurrencyPatchRequestDto } from "../../types/modules/currencies/currency.patch.request.dto";
import { CurrencyUpdateRequestDto } from "../../types/modules/currencies/currency.update.request.dto";

export const httpApiRoutes = {
  "localization.currencies.list": {
    method: "GET",
    path: "/localization/currencies",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleList),
    summary: "List",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(CurrencyResponseDto)
      },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.create": {
    method: "POST",
    path: "/localization/currencies",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleCreate),
    request: { contentType: "application/json", body: CurrencyCreateRequestDto },
    summary: "Create",
    
    
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
  "localization.currencies.filter": {
    method: "POST",
    path: "/localization/currencies/filter",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleFilter),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(CurrencyResponseDto)
      },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.search": {
    method: "GET",
    path: "/localization/currencies/search",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleSearch),
    request: { query: { parameters: { q: { description: "Search text used to match currency records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(CurrencyResponseDto)
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.get": {
    method: "GET",
    path: "/localization/currencies/[code]",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleGet),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Get",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: CurrencyResponseDto
      },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.update": {
    method: "PUT",
    path: "/localization/currencies/[code]",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleUpdate),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: CurrencyUpdateRequestDto
    },
    summary: "Update",
    
    
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
  "localization.currencies.patch": {
    method: "PATCH",
    path: "/localization/currencies/[code]",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handlePatch),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: CurrencyPatchRequestDto
    },
    summary: "Patch",
    
    
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
  "localization.currencies.delete": {
    method: "DELETE",
    path: "/localization/currencies/[code]",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleDelete),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Delete",
    
    
    responses: {
      "204": { description: "Successful response." },
      "422": { description: "Currency has postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchCreate": {
    method: "POST",
    path: "/localization/currencies/batch/create",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchCreate),
    request: { contentType: "application/json", body: Type.Array(CurrencyCreateRequestDto) },
    summary: "Batch Create",
    
    
    responses: {
      "201": { description: "The created currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more currency codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchGet": {
    method: "POST",
    path: "/localization/currencies/batch/get",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchGet),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Get",
    
    
    responses: {
      "200": { description: "The requested currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchUpdate": {
    method: "PUT",
    path: "/localization/currencies/batch/update",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchUpdate),
    request: { contentType: "application/json", body: Type.Array(CurrencyBatchUpdateRequestDto) },
    summary: "Batch Update",
    
    
    responses: {
      "200": { description: "The updated currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more currencies were not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchPatch": {
    method: "PATCH",
    path: "/localization/currencies/batch/patch",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchPatch),
    request: { contentType: "application/json", body: Type.Array(CurrencyBatchPatchRequestDto) },
    summary: "Batch Patch",
    
    
    responses: {
      "200": { description: "The patched currencies.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more currencies were not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchDelete": {
    method: "POST",
    path: "/localization/currencies/batch/delete",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchDelete),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Delete",
    
    
    responses: {
      "204": { description: "The currencies were deleted." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more currencies were not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "One or more currencies have postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.activate": {
    method: "POST",
    path: "/localization/currencies/[code]/activate",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleActivate),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Activate",
    
    
    responses: {
      "200": { description: "Successful response.", body: CurrencyResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.deactivate": {
    method: "POST",
    path: "/localization/currencies/[code]/deactivate",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleDeactivate),
    request: {
      path: {
        code: {
          description: "Currency business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Deactivate",
    
    
    responses: {
      "200": { description: "Successful response.", body: CurrencyResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchActivate": {
    method: "POST",
    path: "/localization/currencies/batch/activate",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchActivate),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Activate",
    
    
    responses: {
      "200": { description: "Successful response.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "localization.currencies.batchDeactivate": {
    method: "POST",
    path: "/localization/currencies/batch/deactivate",
    loadHandler: () => import("./server/http-api/currency.http.handlers").then((module) => module.handleBatchDeactivate),
    request: { contentType: "application/json", body: CurrencyCodesRequestDto },
    summary: "Batch Deactivate",
    
    
    responses: {
      "200": { description: "Successful response.", body: Type.Array(CurrencyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Entity not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
} as const;
