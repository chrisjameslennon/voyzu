import Type from "typebox";
import { BusinessRuleErrorResponseDto, ConflictErrorResponseDto, EntityNotFoundErrorResponseDto, FilterRequestDto, InputValidationErrorResponseDto, InternalServerErrorResponseDto } from "@voyzu/types";
import { PartyResponseDto } from "../../types/modules/parties/party.response.dto";
import { PartyCodesRequestDto } from "../../types/modules/parties/party.codes.request.dto";
import { PartyBatchPatchRequestDto } from "../../types/modules/parties/party.batch-patch.request.dto";
import { PartyBatchUpdateRequestDto } from "../../types/modules/parties/party.batch-update.request.dto";
import { PartyCreateRequestDto } from "../../types/modules/parties/party.create.request.dto";
import { PartyPatchRequestDto } from "../../types/modules/parties/party.patch.request.dto";
import { PartyUpdateRequestDto } from "../../types/modules/parties/party.update.request.dto";

export const httpApiRoutes = {
  "parties.parties.list": {
    description: "List Parties.",
    method: "GET",
    path: "/parties",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleList),
    summary: "List",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(PartyResponseDto)
      },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.create": {
    description: "Create Parties. Status defaults to ACTIVE and cannot be supplied in the request body.",
    method: "POST",
    path: "/parties",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleCreate),
    request: { contentType: "application/json", body: PartyCreateRequestDto },
    summary: "Create",
    
    
    responses: {
      "201": {
        description: "The created party.",
        body: PartyResponseDto
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "422": { description: "Business rule failed.", body: BusinessRuleErrorResponseDto },
      "409": { description: "Conflict.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.filter": {
    description: "Filter Parties.",
    method: "POST",
    path: "/parties/filter",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleFilter),
    request: { contentType: "application/json", body: FilterRequestDto },
    summary: "Filter",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(PartyResponseDto)
      },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.search": {
    description: "Search Parties.",
    method: "GET",
    path: "/parties/search",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleSearch),
    request: { query: { parameters: { q: { description: "Search text used to match party records.", required: true } }, schema: Type.Object({ q: { type: "string" } }) } },
    summary: "Search",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: Type.Array(PartyResponseDto)
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.get": {
    description: "Get Parties.",
    method: "GET",
    path: "/parties/[code]",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleGet),
    request: {
      path: {
        code: {
          description: "Party business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Get",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: PartyResponseDto
      },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.update": {
    description: "Update Parties.",
    method: "PUT",
    path: "/parties/[code]",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleUpdate),
    request: {
      path: {
        code: {
          description: "Party business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: PartyUpdateRequestDto
    },
    summary: "Update",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: PartyResponseDto
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "422": { description: "Business rule failed.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.patch": {
    description: "Patch Parties.",
    method: "PATCH",
    path: "/parties/[code]",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handlePatch),
    request: {
      path: {
        code: {
          description: "Party business code.",
          schema: { type: "string" },
        },
      }, contentType: "application/json", body: PartyPatchRequestDto
    },
    summary: "Patch",
    
    
    responses: {
      "200": {
        description: "Successful response.",
        body: PartyResponseDto
      },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "422": { description: "Business rule failed.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.delete": {
    description: "Delete Parties.",
    method: "DELETE",
    path: "/parties/[code]",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleDelete),
    request: {
      path: {
        code: {
          description: "Party business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Delete",
    
    
    responses: {
      "204": { description: "Successful response." },
      "422": { description: "Party has postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchCreate": {
    description: "Creates multiple parties. Status defaults to ACTIVE and cannot be supplied in the request body.",
    method: "POST",
    path: "/parties/batch/create",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchCreate),
    request: { contentType: "application/json", body: Type.Array(PartyCreateRequestDto) },
    summary: "Batch Create",
    
    
    responses: {
      "201": { description: "The created parties.", body: Type.Array(PartyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "409": { description: "One or more party codes already exist.", body: ConflictErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchGet": {
    description: "Gets multiple parties by code.",
    method: "POST",
    path: "/parties/batch/get",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchGet),
    request: { contentType: "application/json", body: PartyCodesRequestDto },
    summary: "Batch Get",
    
    
    responses: {
      "200": { description: "The requested parties.", body: Type.Array(PartyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchUpdate": {
    description: "Updates multiple parties. Status and code cannot be changed by this request; code identifies each row.",
    method: "PUT",
    path: "/parties/batch/update",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchUpdate),
    request: { contentType: "application/json", body: Type.Array(PartyBatchUpdateRequestDto) },
    summary: "Batch Update",
    
    
    responses: {
      "200": { description: "The updated parties.", body: Type.Array(PartyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more parties were not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchPatch": {
    description: "Patches multiple parties. Status and code cannot be changed by this request; code identifies each row.",
    method: "PATCH",
    path: "/parties/batch/patch",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchPatch),
    request: { contentType: "application/json", body: Type.Array(PartyBatchPatchRequestDto) },
    summary: "Batch Patch",
    
    
    responses: {
      "200": { description: "The patched parties.", body: Type.Array(PartyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more parties were not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchDelete": {
    description: "Deletes multiple parties. Parties with postings cannot be deleted.",
    method: "POST",
    path: "/parties/batch/delete",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchDelete),
    request: { contentType: "application/json", body: PartyCodesRequestDto },
    summary: "Batch Delete",
    
    
    responses: {
      "204": { description: "The parties were deleted." },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "One or more parties were not found.", body: EntityNotFoundErrorResponseDto },
      "422": { description: "One or more parties have postings and cannot be deleted.", body: BusinessRuleErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.activate": {
    description: "Sets a party to ACTIVE.",
    method: "POST",
    path: "/parties/[code]/activate",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleActivate),
    request: {
      path: {
        code: {
          description: "Party business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Activate",
    
    
    responses: {
      "200": { description: "Successful response.", body: PartyResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.deactivate": {
    description: "Sets a party to INACTIVE.",
    method: "POST",
    path: "/parties/[code]/deactivate",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleDeactivate),
    request: {
      path: {
        code: {
          description: "Party business code.",
          schema: { type: "string" },
        },
      }
    },
    summary: "Deactivate",
    
    
    responses: {
      "200": { description: "Successful response.", body: PartyResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchActivate": {
    description: "Sets multiple parties to ACTIVE.",
    method: "POST",
    path: "/parties/batch/activate",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchActivate),
    request: { contentType: "application/json", body: PartyCodesRequestDto },
    summary: "Batch Activate",
    
    
    responses: {
      "200": { description: "Successful response.", body: Type.Array(PartyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
  "parties.parties.batchDeactivate": {
    description: "Sets multiple parties to INACTIVE.",
    method: "POST",
    path: "/parties/batch/deactivate",
    loadHandler: () => import("./server/http-api/party.http.handlers").then((module) => module.handleBatchDeactivate),
    request: { contentType: "application/json", body: PartyCodesRequestDto },
    summary: "Batch Deactivate",
    
    
    responses: {
      "200": { description: "Successful response.", body: Type.Array(PartyResponseDto) },
      "400": { description: "Validation failed.", body: InputValidationErrorResponseDto },
      "404": { description: "Party not found.", body: EntityNotFoundErrorResponseDto },
      "500": { description: "An unexpected server error occurred.", body: InternalServerErrorResponseDto }
    }
  },
} as const;
