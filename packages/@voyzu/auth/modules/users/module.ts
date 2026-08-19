import { handleActivate as handleActivateUser, handleBatchActivate, handleBatchCreate, handleBatchDeactivate, handleBatchDelete, handleBatchGet, handleBatchPatch, handleBatchUpdate, handleChangeCurrentPassword, handleChangePassword, handleCreate as handleCreateUser, handleCurrentProfile, handleDeactivate as handleDeactivateUser, handleDelete as handleDeleteUser, handleFilter as handleFilterUsers, handleGet as handleGetUser, handleList as handleUsersList, handlePatch as handlePatchUser, handleReplaceCompanyAccess, handleSearch as handleSearchUsers, handleUpdateCurrentProfile, handleUpdate as handleUpdateUser } from "@voyzu/auth/users/server";
import { arrayOf, dtoRef } from "@voyzu/types/api";
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { UserDetailPage } from "./server/pages/UserDetailPage";
import { UserProfilePage } from "./server/pages/UserProfilePage";
import { UsersListPage } from "./server/pages/UsersListPage";

const commonResponses = {
  "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") },
  "401": { description: "Authentication failed.", body: dtoRef("UnauthorizedErrorResponseDto") },
  "403": { description: "Access is forbidden.", body: dtoRef("ForbiddenErrorResponseDto") },
  "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") },
} as const;

export const usersModule = {
  pageRoutes: {
    list: {
      id: "voyzu.users.page.list",
      path: "/settings/users",
      Page: UsersListPage,
      pageTitle: "Users",
      helpPath: "help-platform/settings/users",
      breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
      auth: { required: true, minRole: "ADMIN" },
    },
    profile: {
      id: "voyzu.users.page.profile",
      path: "/settings/users/profile",
      Page: UserProfilePage,
      pageTitle: "User Profile",
      helpPath: "help-platform/settings/user-profile",
      breadcrumbBase: [{ label: "Settings" }, { label: "Users" }],
      auth: { required: true, minRole: "COMPANY_USER" },
    },
    detail: {
      id: "voyzu.users.page.detail",
      path: "/settings/users/[code]",
      Page: UserDetailPage,
      pageTitle: "Users",
      helpPath: "help-platform/settings/users",
      breadcrumbBase: [
        { label: "Settings", href: "/settings/users" },
        { label: "Users", href: "/settings/users" },
      ],
      auth: { required: true, minRole: "ADMIN" },
    },
  },
  apiDefinitions: {
    list: {
      method: "GET",
      path: "/users",
      handler: (request: any) => handleUsersList(request),
      summary: "List",
      description: "List Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "A list of users.", body: arrayOf(dtoRef("UserResponseDto")) }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    create: {
      method: "POST",
      path: "/users",
      handler: (request: any) => handleCreateUser(request),
      request: { contentType: "application/json", body: dtoRef("UserCreateRequestDto") },
      summary: "Create",
      description: "Create Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "201": { description: "The created user.", body: dtoRef("UserResponseDto") }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "409": { description: "Conflict.", body: dtoRef("ConflictErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    filter: {
      method: "POST", path: "/user-queries", handler: (request: any) => handleFilterUsers(request),
      request: { contentType: "application/json", body: dtoRef("FilterRequestDto") },
      summary: "Filter",
      description: "Filter Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: arrayOf(dtoRef("UserResponseDto")) }
      }
    },
    search: {
      method: "GET", path: "/user-search-results", handler: (request: any) => handleSearchUsers(request),
      request: { query: { q: { description: "Search text used to match user records.", required: true, schema: { type: "string" } } } },
      summary: "Search",
      description: "Search Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: arrayOf(dtoRef("UserResponseDto")) }
      }
    },
    batchGet: {
      method: "POST", path: "/user-selections", handler: (request: any) => handleBatchGet(request),
      request: { contentType: "application/json", body: dtoRef("CodesRequestDto") },
      summary: "Batch Get",
      description: "Batch Get Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: arrayOf(dtoRef("UserResponseDto")) }
      }
    },
    batchCreate: {
      method: "POST", path: "/user-batches", handler: (request: any) => handleBatchCreate(request),
      request: { contentType: "application/json", body: arrayOf(dtoRef("UserCreateRequestDto")) },
      summary: "Batch Create",
      description: "Batch Create Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: arrayOf(dtoRef("UserResponseDto")) }
      }
    },
    batchUpdate: {
      method: "PUT", path: "/user-batches", handler: (request: any) => handleBatchUpdate(request),
      request: { contentType: "application/json", body: arrayOf(dtoRef("UserBatchUpdateRequestDto")) },
      summary: "Batch Update",
      description: "Batch Update Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: arrayOf(dtoRef("UserResponseDto")) }
      }
    },
    batchPatch: {
      method: "PATCH", path: "/user-batches", handler: (request: any) => handleBatchPatch(request),
      request: { contentType: "application/json", body: arrayOf(dtoRef("UserBatchPatchRequestDto")) },
      summary: "Batch Patch",
      description: "Batch Patch Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: arrayOf(dtoRef("UserResponseDto")) }
      }
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
        "200": { description: "The current user profile.", body: dtoRef("UserResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    updateProfile: {
      method: "PUT",
      path: "/users/me",
      handler: (request: any) => handleUpdateCurrentProfile(request),
      request: { contentType: "application/json", body: dtoRef("UserProfileUpdateRequestDto") },
      summary: "Update Profile",
      description: "Update Profile Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "The updated current user profile.", body: dtoRef("UserResponseDto") }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    profilePassword: {
      method: "PUT",
      path: "/users/me/password",
      handler: (request: any) => handleChangeCurrentPassword(request),
      request: { contentType: "application/json", body: dtoRef("UserPasswordUpdateRequestDto") },
      summary: "Profile Password",
      description: "Profile Password Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "204": { description: "Password changed successfully." }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    get: {
      method: "GET",
      path: "/users/[code]",
      handler: (request: any, context: any) => handleGetUser(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } } },
      summary: "Get",
      description: "Get Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "The requested user.", body: dtoRef("UserResponseDto") }, "404": { description: "Entity not found.", body: dtoRef("EntityNotFoundErrorResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    update: {
      method: "PUT",
      path: "/users/[code]",
      handler: (request: any, context: any) => handleUpdateUser(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, contentType: "application/json", body: dtoRef("UserUpdateRequestDto") },
      summary: "Update",
      description: "Update Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "The updated user.", body: dtoRef("UserResponseDto") }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "404": { description: "Entity not found.", body: dtoRef("EntityNotFoundErrorResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    patch: {
      method: "PATCH", path: "/users/[code]", handler: (request: any, context: any) => handlePatchUser(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, contentType: "application/json", body: dtoRef("UserPatchRequestDto") },
      summary: "Patch",
      description: "Patch Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: dtoRef("UserResponseDto") }
      }
    },
    delete: {
      method: "DELETE",
      path: "/users/[code]",
      handler: (request: any, context: any) => handleDeleteUser(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } } },
      summary: "Delete",
      description: "Delete Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "204": { description: "User deleted successfully." }, "404": { description: "Entity not found.", body: dtoRef("EntityNotFoundErrorResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    activate: {
      method: "PUT", path: "/users/[code]/activation", handler: (request: any, context: any) => handleActivateUser(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } } },
      summary: "Activate",
      description: "Activate Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: dtoRef("UserResponseDto") }
      }
    },
    deactivate: {
      method: "DELETE", path: "/users/[code]/activation", handler: (request: any, context: any) => handleDeactivateUser(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } } },
      summary: "Deactivate",
      description: "Deactivate Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "Successful response.", body: dtoRef("UserResponseDto") }
      }
    },
    changePassword: {
      method: "PUT",
      path: "/users/[code]/password",
      handler: (request: any, context: any) => handleChangePassword(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, contentType: "application/json", body: dtoRef("UserPasswordUpdateRequestDto") },
      summary: "Change Password",
      description: "Change Password Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "204": { description: "Password changed successfully." }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "404": { description: "Entity not found.", body: dtoRef("EntityNotFoundErrorResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    replaceCompanyAccess: {
      method: "PUT",
      path: "/users/[code]/companies",
      handler: (request: any, context: any) => handleReplaceCompanyAccess(request, context),
      request: { path: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, contentType: "application/json", body: dtoRef("UserCompanyAccessUpdateRequestDto") },
      summary: "Replace Company Access",
      description: "Replace Company Access Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "204": { description: "Company access replaced successfully." }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "404": { description: "Entity not found.", body: dtoRef("EntityNotFoundErrorResponseDto") },
        "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    batchActivate: {
      method: "PUT",
      path: "/user-batches/activation",
      handler: (request: any) => handleBatchActivate(request),
      request: { contentType: "application/json", body: dtoRef("CodesRequestDto") },
      summary: "Batch Activate",
      description: "Batch Activate Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "The activated users.", body: arrayOf(dtoRef("UserResponseDto")) }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    batchDeactivate: {
      method: "DELETE",
      path: "/user-batches/activation",
      handler: (request: any) => handleBatchDeactivate(request),
      request: { contentType: "application/json", body: dtoRef("CodesRequestDto") },
      summary: "Batch Deactivate",
      description: "Batch Deactivate Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "200": { description: "The deactivated users.", body: arrayOf(dtoRef("UserResponseDto")) }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
    batchDelete: {
      method: "DELETE",
      path: "/user-batches",
      handler: (request: any) => handleBatchDelete(request),
      request: { contentType: "application/json", body: dtoRef("CodesRequestDto") },
      summary: "Batch Delete",
      description: "Batch Delete Users.",
      tags: ["Users"],
      responses: {
        ...commonResponses,
        "204": { description: "Users deleted successfully." }, "400": { description: "Validation failed.", body: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", body: dtoRef("InternalServerErrorResponseDto") }
      }
    },
  }
} as const satisfies VoyzuPackageModuleDefinition;

export default usersModule;
