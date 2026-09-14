import {
  UserBatchPatchRequestDto,
  UserBatchUpdateRequestDto,
  UserCreateRequestDto,
  UserPasswordUpdateRequestDto,
  UserPatchRequestDto,
  UserProfileUpdateRequestDto,
  UserResponseDto,
  UserUpdateRequestDto,
} from "@voyzu/auth/types";
import {
  BusinessRuleErrorResponseDto,
  CodesRequestDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  FilterRequestDto,
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types";
import Type from "typebox";
import { OrganizationAccessSchema } from "@voyzu/types/business-objects/organization-access";
import { UserOrganizationAccessResponseDto, UserOrganizationAccessUpdateRequestDto } from "../../types/user-organization-access.dto";

const commonResponses = {
  "400": {
    description: "Validation failed.",
    body: InputValidationErrorResponseDto,
  },
  "401": {
    description: "Authentication failed.",
    body: UnauthorizedErrorResponseDto,
  },
  "403": {
    description: "Access is forbidden.",
    body: ForbiddenErrorResponseDto,
  },
  "422": {
    description: "A business rule prevented the operation.",
    body: BusinessRuleErrorResponseDto,
  },
  "500": {
    description: "An unexpected server error occurred.",
    body: InternalServerErrorResponseDto,
  },
} as const;

const userCodePath = Type.String({
  minLength: 1,
  maxLength: 20,
  pattern: "^[A-Z0-9_-]+$",
});

export const httpApiRoutes = {
  "auth.users.getOrganizationAccess": {
    description: "Gets the user's organization assignments and available organizations.",
    method: "GET",
    path: "/users/[code]/organization-access",
    loadHandler: () => import("./server/http-api/user-organization-access.http.handlers").then((module) => module.handleGet),
    summary: "Get user organization access",
    
    
    request: { path: { code: { description: "User code.", schema: userCodePath } } },
    responses: {
      ...commonResponses,
      "200": { description: "Organization assignments and available organizations.", body: UserOrganizationAccessResponseDto },
      "404": { description: "User not found.", body: EntityNotFoundErrorResponseDto },
    },
  },
  "auth.users.replaceOrganizationAccess": {
    description: "Replaces all organization assignments for a standard user through the Organization internal API.",
    method: "PUT",
    path: "/users/[code]/organization-access",
    loadHandler: () => import("./server/http-api/user-organization-access.http.handlers").then((module) => module.handleReplace),
    summary: "Replace user organization access",
    
    
    request: {
      path: { code: { description: "User code.", schema: userCodePath } },
      contentType: "application/json",
      body: UserOrganizationAccessUpdateRequestDto,
    },
    responses: {
      ...commonResponses,
      "200": { description: "Updated organization assignments.", body: OrganizationAccessSchema },
      "404": { description: "User or organization not found.", body: EntityNotFoundErrorResponseDto },
    },
  },
  "auth.users.list": {
    description: "List Users.",
    method: "GET",
    path: "/users",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleList),
    summary: "List",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "A list of users.",
        body: Type.Array(UserResponseDto),
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.create": {
    description: "Create Users.",
    method: "POST",
    path: "/users",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleCreate),
    request: {
      contentType: "application/json",
      body: UserCreateRequestDto,
    },
    summary: "Create",
    
    
    responses: {
      ...commonResponses,
      "201": {
        description: "The created user.",
        body: UserResponseDto,
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "409": {
        description: "Conflict.",
        body: ConflictErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.filter": {
    description: "Filter Users.",
    method: "POST",
    path: "/user-queries",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleFilter),
    request: {
      contentType: "application/json",
      body: FilterRequestDto,
    },
    summary: "Filter",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  "auth.users.search": {
    description: "Search Users.",
    method: "GET",
    path: "/user-search-results",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleSearch),
    request: {
      query: {
        parameters: {
          q: {
            description: "Search text used to match user records.",
            required: true,
          },
        },
        schema: Type.Object({ q: Type.String({ pattern: "\\S" }) }),
      },
    },
    summary: "Search",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  "auth.users.batchGet": {
    description: "Batch Get Users.",
    method: "POST",
    path: "/user-selections",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchGet),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Get",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  "auth.users.batchCreate": {
    description: "Batch Create Users.",
    method: "POST",
    path: "/user-batches",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchCreate),
    request: {
      contentType: "application/json",
      body: Type.Array(UserCreateRequestDto, { minItems: 1 }),
    },
    summary: "Batch Create",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  "auth.users.batchUpdate": {
    description: "Batch Update Users.",
    method: "PUT",
    path: "/user-batches",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchUpdate),
    request: {
      contentType: "application/json",
      body: Type.Array(UserBatchUpdateRequestDto, { minItems: 1 }),
    },
    summary: "Batch Update",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  "auth.users.batchPatch": {
    description: "Batch Patch Users.",
    method: "PATCH",
    path: "/user-batches",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchPatch),
    request: {
      contentType: "application/json",
      body: Type.Array(UserBatchPatchRequestDto, { minItems: 1 }),
    },
    summary: "Batch Patch",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  "auth.users.profile": {
    description: "Profile Users.",
    method: "GET",
    path: "/users/me",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleCurrentProfile),
    summary: "Profile",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The current user profile.",
        body: UserResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.updateProfile": {
    description: "Update Profile Users.",
    method: "PUT",
    path: "/users/me",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleUpdateCurrentProfile),
    request: {
      contentType: "application/json",
      body: UserProfileUpdateRequestDto,
    },
    summary: "Update Profile",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The updated current user profile.",
        body: UserResponseDto,
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.profilePassword": {
    description: "Profile Password Users.",
    method: "PUT",
    path: "/users/me/password",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleChangeCurrentPassword),
    request: {
      contentType: "application/json",
      body: UserPasswordUpdateRequestDto,
    },
    summary: "Profile Password",
    
    
    responses: {
      ...commonResponses,
      "204": { description: "Password changed successfully." },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.get": {
    description: "Get Users.",
    method: "GET",
    path: "/users/[code]",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleGet),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Get",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The requested user.",
        body: UserResponseDto,
      },
      "404": {
        description: "Entity not found.",
        body: EntityNotFoundErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.update": {
    description: "Update Users.",
    method: "PUT",
    path: "/users/[code]",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleUpdate),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
      contentType: "application/json",
      body: UserUpdateRequestDto,
    },
    summary: "Update",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The updated user.",
        body: UserResponseDto,
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "404": {
        description: "Entity not found.",
        body: EntityNotFoundErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.patch": {
    description: "Patch Users.",
    method: "PATCH",
    path: "/users/[code]",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handlePatch),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
      contentType: "application/json",
      body: UserPatchRequestDto,
    },
    summary: "Patch",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: UserResponseDto,
      },
    },
  },
  "auth.users.delete": {
    description: "Delete Users.",
    method: "DELETE",
    path: "/users/[code]",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleDelete),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Delete",
    
    
    responses: {
      ...commonResponses,
      "204": { description: "User deleted successfully." },
      "404": {
        description: "Entity not found.",
        body: EntityNotFoundErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.activate": {
    description: "Activate Users.",
    method: "PUT",
    path: "/users/[code]/activation",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleActivate),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Activate",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: UserResponseDto,
      },
    },
  },
  "auth.users.deactivate": {
    description: "Deactivate Users.",
    method: "DELETE",
    path: "/users/[code]/activation",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleDeactivate),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Deactivate",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: UserResponseDto,
      },
    },
  },
  "auth.users.changePassword": {
    description: "Change Password Users.",
    method: "PUT",
    path: "/users/[code]/password",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleChangePassword),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
      contentType: "application/json",
      body: UserPasswordUpdateRequestDto,
    },
    summary: "Change Password",
    
    
    responses: {
      ...commonResponses,
      "204": { description: "Password changed successfully." },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "404": {
        description: "Entity not found.",
        body: EntityNotFoundErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.batchActivate": {
    description: "Batch Activate Users.",
    method: "PUT",
    path: "/user-batches/activation",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchActivate),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Activate",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The activated users.",
        body: Type.Array(UserResponseDto),
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.batchDeactivate": {
    description: "Batch Deactivate Users.",
    method: "DELETE",
    path: "/user-batches/activation",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchDeactivate),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Deactivate",
    
    
    responses: {
      ...commonResponses,
      "200": {
        description: "The deactivated users.",
        body: Type.Array(UserResponseDto),
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  "auth.users.batchDelete": {
    description: "Batch Delete Users.",
    method: "DELETE",
    path: "/user-batches",
    loadHandler: () => import("./server/http-api/user.http.handlers").then((module) => module.handleBatchDelete),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Delete",
    
    
    responses: {
      ...commonResponses,
      "204": { description: "Users deleted successfully." },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
} as const;
