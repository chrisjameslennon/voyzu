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
} from "@voyzu/package-management/types";

const tag = ["Package Management"];

const idPathParameter = {
  id: {
    description: "Numeric identifier of the installed package record.",
    schema: Type.String({ pattern: "^[1-9][0-9]*$" }),
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

export const httpApiRoutes = {
  "package-management.package-management.list": {
    description: "Lists the packages currently recorded as installed in this Voyzu instance.",
    method: "GET",
    path: "/installed-packages",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleList),
    summary: "List Packages",
    
    
    responses: {
      "200": {
        description: "Installed packages.",
        body: Type.Array(InstalledPackageResponseDto),
      },
      ...commonResponses,
    },
  },
  "package-management.package-management.get": {
    description: "Gets one installed package record.",
    method: "GET",
    path: "/installed-packages/[id]",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleGet),
    request: { path: idPathParameter },
    summary: "Get Package",
    
    
    responses: {
      "200": {
        description: "The installed package.",
        body: InstalledPackageResponseDto,
      },
      "404": { description: "The installed package was not found." },
      ...commonResponses,
    },
  },
  "package-management.package-management.update": {
    description: "Controls top-navigation visibility and direct access to an installed package's page routes. HTTP API routes are unaffected.",
    method: "PUT",
    path: "/installed-packages/[id]",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleUpdate),
    request: {
      path: idPathParameter,
      contentType: "application/json",
      body: InstalledPackageUpdateRequestDto,
    },
    summary: "Update Package Visibility",
    
    
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
  "package-management.package-management.move": {
    description: "Moves a package up or down in top-navigation order.",
    method: "PUT",
    path: "/installed-packages/[id]/navigation-order",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleMove),
    request: {
      path: idPathParameter,
      contentType: "application/json",
      body: InstalledPackageMoveRequestDto,
    },
    summary: "Move Package Navigation",
    
    
    responses: {
      "200": {
        description: "The reordered package inventory.",
        body: Type.Array(InstalledPackageResponseDto),
      },
      "404": { description: "The installed package was not found." },
      "422": {
        description: "The package cannot be moved in that direction.",
      },
      ...commonResponses,
    },
  },
  "package-management.package-management.refresh": {
    description: "Reconciles package-management records with packages installed on the filesystem.",
    method: "POST",
    path: "/installed-package-reconciliation",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleRefresh),
    summary: "Refresh Package Inventory",
    
    
    responses: {
      "200": {
        description: "The reconciled package inventory.",
        body: Type.Array(InstalledPackageResponseDto),
      },
      ...commonResponses,
    },
  },
  "package-management.package-management.getHomePage": {
    description: "Gets the application start-page route.",
    method: "GET",
    path: "/package-settings/home-page",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleGetHomePage),
    summary: "Get Home Page",
    
    
    responses: {
      "200": {
        description: "The configured start page.",
        body: HomePageRouteResponseDto,
      },
      ...commonResponses,
    },
  },
  "package-management.package-management.updateHomePage": {
    description: "Validates and updates the application start-page route.",
    method: "PUT",
    path: "/package-settings/home-page",
    loadHandler: () => import("./server/http-api/installed-package.http.handlers").then((module) => module.handleUpdateHomePage),
    request: {
      contentType: "application/json",
      body: HomePageRouteUpdateRequestDto,
    },
    summary: "Update Home Page",
    
    
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
