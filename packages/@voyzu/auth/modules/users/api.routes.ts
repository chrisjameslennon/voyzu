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

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/users",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleList),
    summary: "List",
    description: "List Users.",
    tags: ["Users"],
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
  create: {
    method: "POST",
    path: "/users",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleCreate),
    request: {
      contentType: "application/json",
      body: UserCreateRequestDto,
    },
    summary: "Create",
    description: "Create Users.",
    tags: ["Users"],
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
  filter: {
    method: "POST",
    path: "/user-queries",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleFilter),
    request: {
      contentType: "application/json",
      body: FilterRequestDto,
    },
    summary: "Filter",
    description: "Filter Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  search: {
    method: "GET",
    path: "/user-search-results",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleSearch),
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
    description: "Search Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  batchGet: {
    method: "POST",
    path: "/user-selections",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchGet),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Get",
    description: "Batch Get Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  batchCreate: {
    method: "POST",
    path: "/user-batches",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchCreate),
    request: {
      contentType: "application/json",
      body: Type.Array(UserCreateRequestDto, { minItems: 1 }),
    },
    summary: "Batch Create",
    description: "Batch Create Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  batchUpdate: {
    method: "PUT",
    path: "/user-batches",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchUpdate),
    request: {
      contentType: "application/json",
      body: Type.Array(UserBatchUpdateRequestDto, { minItems: 1 }),
    },
    summary: "Batch Update",
    description: "Batch Update Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  batchPatch: {
    method: "PATCH",
    path: "/user-batches",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchPatch),
    request: {
      contentType: "application/json",
      body: Type.Array(UserBatchPatchRequestDto, { minItems: 1 }),
    },
    summary: "Batch Patch",
    description: "Batch Patch Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: Type.Array(UserResponseDto),
      },
    },
  },
  profile: {
    method: "GET",
    path: "/users/me",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleCurrentProfile),
    summary: "Profile",
    description: "Profile Users.",
    tags: ["Users"],
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
  updateProfile: {
    method: "PUT",
    path: "/users/me",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleUpdateCurrentProfile),
    request: {
      contentType: "application/json",
      body: UserProfileUpdateRequestDto,
    },
    summary: "Update Profile",
    description: "Update Profile Users.",
    tags: ["Users"],
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
  profilePassword: {
    method: "PUT",
    path: "/users/me/password",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleChangeCurrentPassword),
    request: {
      contentType: "application/json",
      body: UserPasswordUpdateRequestDto,
    },
    summary: "Profile Password",
    description: "Profile Password Users.",
    tags: ["Users"],
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
  get: {
    method: "GET",
    path: "/users/[code]",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleGet),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Get",
    description: "Get Users.",
    tags: ["Users"],
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
  update: {
    method: "PUT",
    path: "/users/[code]",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleUpdate),
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
    description: "Update Users.",
    tags: ["Users"],
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
  patch: {
    method: "PATCH",
    path: "/users/[code]",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handlePatch),
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
    description: "Patch Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: UserResponseDto,
      },
    },
  },
  delete: {
    method: "DELETE",
    path: "/users/[code]",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleDelete),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Delete",
    description: "Delete Users.",
    tags: ["Users"],
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
  activate: {
    method: "PUT",
    path: "/users/[code]/activation",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleActivate),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Activate",
    description: "Activate Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: UserResponseDto,
      },
    },
  },
  deactivate: {
    method: "DELETE",
    path: "/users/[code]/activation",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleDeactivate),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
    },
    summary: "Deactivate",
    description: "Deactivate Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "200": {
        description: "Successful response.",
        body: UserResponseDto,
      },
    },
  },
  changePassword: {
    method: "PUT",
    path: "/users/[code]/password",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleChangePassword),
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
    description: "Change Password Users.",
    tags: ["Users"],
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
  batchActivate: {
    method: "PUT",
    path: "/user-batches/activation",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchActivate),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Activate",
    description: "Batch Activate Users.",
    tags: ["Users"],
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
  batchDeactivate: {
    method: "DELETE",
    path: "/user-batches/activation",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchDeactivate),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Deactivate",
    description: "Batch Deactivate Users.",
    tags: ["Users"],
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
  batchDelete: {
    method: "DELETE",
    path: "/user-batches",
    loadHandler: () => import("./server/api/user.http.handlers").then((module) => module.handleBatchDelete),
    request: {
      contentType: "application/json",
      body: CodesRequestDto,
    },
    summary: "Batch Delete",
    description: "Batch Delete Users.",
    tags: ["Users"],
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
