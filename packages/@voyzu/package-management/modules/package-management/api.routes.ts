import {
  ForbiddenErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types";
import Type from "typebox";
import {
  HomePageRouteResponseDto,
  HomePageRouteUpdateRequestDto,
  InstalledPackageMoveRequestDto,
  InstalledPackageResponseDto,
  InstalledPackageUpdateRequestDto,
} from "../types";
import {
  handleGet,
  handleGetHomePage,
  handleList,
  handleMove,
  handleRefresh,
  handleUpdate,
  handleUpdateHomePage,
} from "./server/api/installed-package.http.handlers";

const tag = ["Package Management"];

const idPathParameter = {
  id: {
    description: "Numeric identifier of the installed package record.",
    schema: Type.Integer({ minimum: 1 }),
  },
} as const;

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
    description: "Administrator access is required.",
    body: ForbiddenErrorResponseDto,
  },
  "500": {
    description: "An unexpected server error occurred.",
    body: InternalServerErrorResponseDto,
  },
} as const;

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/installed-packages",
    handler: handleList,
    summary: "List Packages",
    description:
      "Lists the packages currently recorded as installed in this Voyzu instance.",
    tags: tag,
    responses: {
      "200": {
        description: "Installed packages.",
        body: Type.Array(InstalledPackageResponseDto),
      },
      ...commonResponses,
    },
  },
  get: {
    method: "GET",
    path: "/installed-packages/[id]",
    handler: handleGet,
    request: { path: idPathParameter },
    summary: "Get Package",
    description: "Gets one installed package record.",
    tags: tag,
    responses: {
      "200": {
        description: "The installed package.",
        body: InstalledPackageResponseDto,
      },
      "404": { description: "The installed package was not found." },
      ...commonResponses,
    },
  },
  update: {
    method: "PUT",
    path: "/installed-packages/[id]",
    handler: handleUpdate,
    request: {
      path: idPathParameter,
      contentType: "application/json",
      body: InstalledPackageUpdateRequestDto,
    },
    summary: "Update Package Visibility",
    description:
      "Controls top-navigation visibility and direct access to an installed package's page routes. API routes are unaffected.",
    tags: tag,
    responses: {
      "200": {
        description: "The updated package.",
        body: InstalledPackageResponseDto,
      },
      "404": { description: "The installed package was not found." },
      "422": {
        description: "The requested visibility change is not permitted.",
      },
      ...commonResponses,
    },
  },
  move: {
    method: "PUT",
    path: "/installed-packages/[id]/navigation-order",
    handler: handleMove,
    request: {
      path: idPathParameter,
      contentType: "application/json",
      body: InstalledPackageMoveRequestDto,
    },
    summary: "Move Package Navigation",
    description: "Moves a package up or down in top-navigation order.",
    tags: tag,
    responses: {
      "200": {
        description: "The reordered package.",
        body: InstalledPackageResponseDto,
      },
      "404": { description: "The installed package was not found." },
      "422": {
        description: "The package cannot be moved in that direction.",
      },
      ...commonResponses,
    },
  },
  refresh: {
    method: "POST",
    path: "/installed-package-reconciliation",
    handler: handleRefresh,
    summary: "Refresh Package Inventory",
    description:
      "Reconciles package-management records with packages installed on the filesystem.",
    tags: tag,
    responses: {
      "200": {
        description: "The reconciled package inventory.",
        body: Type.Array(InstalledPackageResponseDto),
      },
      ...commonResponses,
    },
  },
  getHomePage: {
    method: "GET",
    path: "/package-settings/home-page",
    handler: handleGetHomePage,
    summary: "Get Home Page",
    description: "Gets the application start-page route.",
    tags: tag,
    responses: {
      "200": {
        description: "The configured start page.",
        body: HomePageRouteResponseDto,
      },
      ...commonResponses,
    },
  },
  updateHomePage: {
    method: "PUT",
    path: "/package-settings/home-page",
    handler: handleUpdateHomePage,
    request: {
      contentType: "application/json",
      body: HomePageRouteUpdateRequestDto,
    },
    summary: "Update Home Page",
    description: "Validates and updates the application start-page route.",
    tags: tag,
    responses: {
      "200": {
        description: "The updated start page.",
        body: HomePageRouteResponseDto,
      },
      "422": {
        description:
          "The route is invalid or is not a registered Voyzu page.",
      },
      ...commonResponses,
    },
  },
} as const;
