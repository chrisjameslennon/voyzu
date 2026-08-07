import { arrayOf, dtoRef } from "@voyzu/types/api";
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import {
  handleGet,
  handleGetHomePage,
  handleList,
  handleMove,
  handleRefresh,
  handleUpdate,
  handleUpdateHomePage,
} from "./server/api/installed-package.http.handlers";
import { InstalledPackageDetailPage } from "./server/pages/InstalledPackageDetailPage";
import { InstalledPackagesListPage } from "./server/pages/InstalledPackagesListPage";

const tag = ["Package Management"];
const idPathParameter = {
  id: {
    description: "Numeric identifier of the installed package record.",
    schema: { type: "number" },
  },
} as const;
const serverErrorResponse = {
  "500": { description: "An unexpected server error occurred." },
} as const;

export const packageManagementModule = {
  pageRoutes: {
    list: {
      id: "voyzu.package-management.page.list",
      path: "/settings/packages",
      Page: InstalledPackagesListPage,
      pageTitle: "Packages",
      helpPath: "help-platform/settings/installed-packages",
      breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
      auth: { required: true, minRole: "ADMIN" },
    },
    detail: {
      id: "voyzu.package-management.page.detail",
      path: "/settings/packages/[id]",
      Page: InstalledPackageDetailPage,
      pageTitle: "Packages",
      helpPath: "help-platform/settings/installed-packages",
      breadcrumbBase: [
        { label: "Settings", href: "/settings/users" },
        { label: "Packages", href: "/settings/packages" },
      ],
      auth: { required: true, minRole: "ADMIN" },
    },
  },
  apiDefinitions: {
    list: {
      method: "GET",
      path: "/installed-packages",
      handler: handleList,
      apiDoc: {
        summary: "List Packages",
        description: "Lists the packages currently recorded as installed in this Voyzu instance.",
        tags: tag,
        responses: {
          "200": { description: "Installed packages.", schema: arrayOf(dtoRef("InstalledPackageResponseDto")) },
          "403": { description: "Administrator access is required." },
          ...serverErrorResponse,
        },
      },
    },
    get: {
      method: "GET",
      path: "/installed-packages/[id]",
      handler: handleGet,
      apiDoc: {
        summary: "Get Package",
        description: "Gets one installed package record.",
        tags: tag,
        requestPathParams: idPathParameter,
        responses: {
          "200": { description: "The installed package.", schema: dtoRef("InstalledPackageResponseDto") },
          "403": { description: "Administrator access is required." },
          "404": { description: "The installed package was not found." },
          ...serverErrorResponse,
        },
      },
    },
    update: {
      method: "PUT",
      path: "/installed-packages/[id]",
      handler: handleUpdate,
      apiDoc: {
        summary: "Update Package Status",
        description: "Activates or deactivates an installed package.",
        tags: tag,
        requestPathParams: idPathParameter,
        requestBody: { required: true, schema: dtoRef("InstalledPackageUpdateRequestDto") },
        responses: {
          "200": { description: "The updated package.", schema: dtoRef("InstalledPackageResponseDto") },
          "403": { description: "Administrator access is required." },
          "404": { description: "The installed package was not found." },
          "422": { description: "The requested status change is not permitted." },
          ...serverErrorResponse,
        },
      },
    },
    move: {
      method: "PUT",
      path: "/installed-packages/[id]/navigation-order",
      handler: handleMove,
      apiDoc: {
        summary: "Move Package Navigation",
        description: "Moves a package up or down in top-navigation order.",
        tags: tag,
        requestPathParams: idPathParameter,
        requestBody: { required: true, schema: dtoRef("InstalledPackageMoveRequestDto") },
        responses: {
          "200": { description: "The reordered package.", schema: dtoRef("InstalledPackageResponseDto") },
          "403": { description: "Administrator access is required." },
          "404": { description: "The installed package was not found." },
          "422": { description: "The package cannot be moved in that direction." },
          ...serverErrorResponse,
        },
      },
    },
    refresh: {
      method: "POST",
      path: "/installed-package-reconciliation",
      handler: handleRefresh,
      apiDoc: {
        summary: "Refresh Package Inventory",
        description: "Reconciles package-management records with packages installed on the filesystem.",
        tags: tag,
        responses: {
          "200": { description: "The reconciled package inventory.", schema: arrayOf(dtoRef("InstalledPackageResponseDto")) },
          "403": { description: "Administrator access is required." },
          ...serverErrorResponse,
        },
      },
    },
    getHomePage: {
      method: "GET",
      path: "/package-settings/home-page",
      handler: handleGetHomePage,
      apiDoc: {
        summary: "Get Home Page",
        description: "Gets the application start-page route.",
        tags: tag,
        responses: {
          "200": { description: "The configured start page.", schema: dtoRef("HomePageRouteResponseDto") },
          "403": { description: "Administrator access is required." },
          ...serverErrorResponse,
        },
      },
    },
    updateHomePage: {
      method: "PUT",
      path: "/package-settings/home-page",
      handler: handleUpdateHomePage,
      apiDoc: {
        summary: "Update Home Page",
        description: "Validates and updates the application start-page route.",
        tags: tag,
        requestBody: { required: true, schema: dtoRef("HomePageRouteUpdateRequestDto") },
        responses: {
          "200": { description: "The updated start page.", schema: dtoRef("HomePageRouteResponseDto") },
          "403": { description: "Administrator access is required." },
          "422": { description: "The route is invalid or is not a registered Voyzu page." },
          ...serverErrorResponse,
        },
      },
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;

export default packageManagementModule;
