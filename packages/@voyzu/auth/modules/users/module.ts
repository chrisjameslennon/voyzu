import { handleActivate as handleActivateUser, handleBatchActivate, handleBatchCreate, handleBatchDeactivate, handleBatchDelete, handleBatchGet, handleBatchPatch, handleBatchUpdate, handleChangeCurrentPassword, handleChangePassword, handleCreate as handleCreateUser, handleCurrentProfile, handleDeactivate as handleDeactivateUser, handleDelete as handleDeleteUser, handleFilter as handleFilterUsers, handleGet as handleGetUser, handleList as handleUsersList, handlePatch as handlePatchUser, handleReplaceCompanyAccess, handleSearch as handleSearchUsers, handleUpdateCurrentProfile, handleUpdate as handleUpdateUser } from "@voyzu/auth/users/server";
import { arrayOf, dtoRef } from "@voyzu/types/api";
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { UserDetailPage } from "./server/pages/UserDetailPage";
import { UserProfilePage } from "./server/pages/UserProfilePage";
import { UsersListPage } from "./server/pages/UsersListPage";

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
      apiDoc: {
        summary: "List",
        description: "List Users.",
        tags: ["Users"],
        responses: { "200": { description: "A list of users.", schema: arrayOf(dtoRef("UserResponseDto")) }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    create: {
      method: "POST",
      path: "/users",
      handler: (request: any) => handleCreateUser(request),
      apiDoc: {
        summary: "Create",
        description: "Create Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("UserCreateRequestDto") },
        responses: { "201": { description: "The created user.", schema: dtoRef("UserResponseDto") }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "409": { description: "Conflict.", schema: dtoRef("ConflictErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    filter: { method: "POST", path: "/user-queries", handler: (request: any) => handleFilterUsers(request), apiDoc: { summary: "Filter", description: "Filter Users.", tags: ["Users"], requestBody: { required: true, schema: dtoRef("FilterRequestDto") }, responses: { "200": { description: "Successful response.", schema: arrayOf(dtoRef("UserResponseDto")) } } } },
    search: { method: "GET", path: "/user-search-results", handler: (request: any) => handleSearchUsers(request), apiDoc: { summary: "Search", description: "Search Users.", tags: ["Users"], requestQuerystringParams: { q: { description: "Search text used to match user records.", schema: { type: "string" } } }, responses: { "200": { description: "Successful response.", schema: arrayOf(dtoRef("UserResponseDto")) } } } },
    batchGet: { method: "POST", path: "/user-selections", handler: (request: any) => handleBatchGet(request), apiDoc: { summary: "Batch Get", description: "Batch Get Users.", tags: ["Users"], requestBody: { required: true, schema: dtoRef("CodesRequestDto") }, responses: { "200": { description: "Successful response.", schema: arrayOf(dtoRef("UserResponseDto")) } } } },
    batchCreate: { method: "POST", path: "/user-batches", handler: (request: any) => handleBatchCreate(request), apiDoc: { summary: "Batch Create", description: "Batch Create Users.", tags: ["Users"], requestBody: { required: true, schema: arrayOf(dtoRef("UserCreateRequestDto")) }, responses: { "200": { description: "Successful response.", schema: arrayOf(dtoRef("UserResponseDto")) } } } },
    batchUpdate: { method: "PUT", path: "/user-batches", handler: (request: any) => handleBatchUpdate(request), apiDoc: { summary: "Batch Update", description: "Batch Update Users.", tags: ["Users"], requestBody: { required: true, schema: arrayOf(dtoRef("UserBatchUpdateRequestDto")) }, responses: { "200": { description: "Successful response.", schema: arrayOf(dtoRef("UserResponseDto")) } } } },
    batchPatch: { method: "PATCH", path: "/user-batches", handler: (request: any) => handleBatchPatch(request), apiDoc: { summary: "Batch Patch", description: "Batch Patch Users.", tags: ["Users"], requestBody: { required: true, schema: arrayOf(dtoRef("UserBatchPatchRequestDto")) }, responses: { "200": { description: "Successful response.", schema: arrayOf(dtoRef("UserResponseDto")) } } } },
    profile: {
      method: "GET",
      path: "/users/me",
      handler: (request: any) => handleCurrentProfile(request),
      apiDoc: {
        summary: "Profile",
        description: "Profile Users.",
        tags: ["Users"],
        responses: { "200": { description: "The current user profile.", schema: dtoRef("UserResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    updateProfile: {
      method: "PUT",
      path: "/users/me",
      handler: (request: any) => handleUpdateCurrentProfile(request),
      apiDoc: {
        summary: "Update Profile",
        description: "Update Profile Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("UserProfileUpdateRequestDto") },
        responses: { "200": { description: "The updated current user profile.", schema: dtoRef("UserResponseDto") }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    profilePassword: {
      method: "PUT",
      path: "/users/me/password",
      handler: (request: any) => handleChangeCurrentPassword(request),
      apiDoc: {
        summary: "Profile Password",
        description: "Profile Password Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("UserPasswordUpdateRequestDto") },
        responses: { "204": { description: "Password changed successfully." }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    get: {
      method: "GET",
      path: "/users/[code]",
      handler: (request: any, context: any) => handleGetUser(request, context),
      apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } },
        summary: "Get",
        description: "Get Users.",
        tags: ["Users"],
        responses: {
          "200": { description: "The requested user.", schema: dtoRef("UserResponseDto") }, "404": { description: "Entity not found.", schema: dtoRef("EntityNotFoundErrorResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") }
        },
      },
    },
    update: {
      method: "PUT",
      path: "/users/[code]",
      handler: (request: any, context: any) => handleUpdateUser(request, context),
      apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } },
        summary: "Update",
        description: "Update Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("UserUpdateRequestDto") },
        responses: {
          "200": { description: "The updated user.", schema: dtoRef("UserResponseDto") }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "404": { description: "Entity not found.", schema: dtoRef("EntityNotFoundErrorResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") }
        },
      },
    },
    patch: { method: "PATCH", path: "/users/[code]", handler: (request: any, context: any) => handlePatchUser(request, context), apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, summary: "Patch", description: "Patch Users.", tags: ["Users"], requestBody: { required: true, schema: dtoRef("UserPatchRequestDto") }, responses: { "200": { description: "Successful response.", schema: dtoRef("UserResponseDto") } } } },
    delete: {
      method: "DELETE",
      path: "/users/[code]",
      handler: (request: any, context: any) => handleDeleteUser(request, context),
      apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } },
        summary: "Delete",
        description: "Delete Users.",
        tags: ["Users"],
        responses: {
          "204": { description: "User deleted successfully." }, "404": { description: "Entity not found.", schema: dtoRef("EntityNotFoundErrorResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") }
        },
      },
    },
    activate: { method: "PUT", path: "/users/[code]/activation", handler: (request: any, context: any) => handleActivateUser(request, context), apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, summary: "Activate", description: "Activate Users.", tags: ["Users"], responses: { "200": { description: "Successful response.", schema: dtoRef("UserResponseDto") } } } },
    deactivate: { method: "DELETE", path: "/users/[code]/activation", handler: (request: any, context: any) => handleDeactivateUser(request, context), apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } }, summary: "Deactivate", description: "Deactivate Users.", tags: ["Users"], responses: { "200": { description: "Successful response.", schema: dtoRef("UserResponseDto") } } } },
    changePassword: {
      method: "PUT",
      path: "/users/[code]/password",
      handler: (request: any, context: any) => handleChangePassword(request, context),
      apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } },
        summary: "Change Password",
        description: "Change Password Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("UserPasswordUpdateRequestDto") },
        responses: {
          "204": { description: "Password changed successfully." }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "404": { description: "Entity not found.", schema: dtoRef("EntityNotFoundErrorResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") }
        },
      },
    },
    replaceCompanyAccess: {
      method: "PUT",
      path: "/users/[code]/companies",
      handler: (request: any, context: any) => handleReplaceCompanyAccess(request, context),
      apiDoc: { requestPathParams: { code: { description: "Business code of the requested record.", schema: { type: "string" } } },
        summary: "Replace Company Access",
        description: "Replace Company Access Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("UserCompanyAccessUpdateRequestDto") },
        responses: {
          "204": { description: "Company access replaced successfully." }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "404": { description: "Entity not found.", schema: dtoRef("EntityNotFoundErrorResponseDto") },
          "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") }
        },
      },
    },
    batchActivate: {
      method: "PUT",
      path: "/user-batches/activation",
      handler: (request: any) => handleBatchActivate(request),
      apiDoc: {
        summary: "Batch Activate",
        description: "Batch Activate Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("CodesRequestDto") },
        responses: { "200": { description: "The activated users.", schema: arrayOf(dtoRef("UserResponseDto")) }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    batchDeactivate: {
      method: "DELETE",
      path: "/user-batches/activation",
      handler: (request: any) => handleBatchDeactivate(request),
      apiDoc: {
        summary: "Batch Deactivate",
        description: "Batch Deactivate Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("CodesRequestDto") },
        responses: { "200": { description: "The deactivated users.", schema: arrayOf(dtoRef("UserResponseDto")) }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
    batchDelete: {
      method: "DELETE",
      path: "/user-batches",
      handler: (request: any) => handleBatchDelete(request),
      apiDoc: {
        summary: "Batch Delete",
        description: "Batch Delete Users.",
        tags: ["Users"],
        requestBody: { required: true, schema: dtoRef("CodesRequestDto") },
        responses: { "204": { description: "Users deleted successfully." }, "400": { description: "Validation failed.", schema: dtoRef("InputValidationErrorResponseDto") }, "500": { description: "An unexpected server error occurred.", schema: dtoRef("InternalServerErrorResponseDto") } },
      },
    },
  }
} as const satisfies VoyzuPackageModuleDefinition;

export default usersModule;
