import {
  UserBatchPatchRequestDto,
  UserBatchUpdateRequestDto,
  UserCompanyAccessUpdateRequestDto,
  UserCreateRequestDto,
  UserPasswordUpdateRequestDto,
  UserPatchRequestDto,
  UserProfileUpdateRequestDto,
  UserResponseDto,
  UserUpdateRequestDto,
} from "@voyzu/auth/types";
import {
  handleActivate as handleActivateUser,
  handleBatchActivate,
  handleBatchCreate,
  handleBatchDeactivate,
  handleBatchDelete,
  handleBatchGet,
  handleBatchPatch,
  handleBatchUpdate,
  handleChangeCurrentPassword,
  handleChangePassword,
  handleCreate as handleCreateUser,
  handleCurrentProfile,
  handleDeactivate as handleDeactivateUser,
  handleDelete as handleDeleteUser,
  handleFilter as handleFilterUsers,
  handleGet as handleGetUser,
  handlePatch as handlePatchUser,
  handleReplaceCompanyAccess,
  handleSearch as handleSearchUsers,
  handleUpdateCurrentProfile,
  handleUpdate as handleUpdateUser,
  handleList as handleUsersList,
} from "@voyzu/auth/users/server";
import {
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
    handler: (request: any) => handleUsersList(request),
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
    handler: (request: any) => handleCreateUser(request),
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
    handler: (request: any) => handleFilterUsers(request),
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
    handler: (request: any) => handleSearchUsers(request),
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
    handler: (request: any) => handleBatchGet(request),
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
    handler: (request: any) => handleBatchCreate(request),
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
    handler: (request: any) => handleBatchUpdate(request),
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
    handler: (request: any) => handleBatchPatch(request),
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
    handler: (request: any) => handleCurrentProfile(request),
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
    handler: (request: any) => handleUpdateCurrentProfile(request),
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
    handler: (request: any) => handleChangeCurrentPassword(request),
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
    handler: (request: any, context: any) => handleGetUser(request, context),
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
    handler: (request: any, context: any) =>
      handleUpdateUser(request, context),
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
    handler: (request: any, context: any) =>
      handlePatchUser(request, context),
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
    handler: (request: any, context: any) =>
      handleDeleteUser(request, context),
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
    handler: (request: any, context: any) =>
      handleActivateUser(request, context),
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
    handler: (request: any, context: any) =>
      handleDeactivateUser(request, context),
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
    handler: (request: any, context: any) =>
      handleChangePassword(request, context),
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
  replaceCompanyAccess: {
    method: "PUT",
    path: "/users/[code]/companies",
    handler: (request: any, context: any) =>
      handleReplaceCompanyAccess(request, context),
    request: {
      path: {
        code: {
          description: "Business code of the requested record.",
          schema: userCodePath,
        },
      },
      contentType: "application/json",
      body: UserCompanyAccessUpdateRequestDto,
    },
    summary: "Replace Company Access",
    description: "Replace Company Access Users.",
    tags: ["Users"],
    responses: {
      ...commonResponses,
      "204": { description: "Company access replaced successfully." },
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
    handler: (request: any) => handleBatchActivate(request),
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
    handler: (request: any) => handleBatchDeactivate(request),
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
    handler: (request: any) => handleBatchDelete(request),
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
