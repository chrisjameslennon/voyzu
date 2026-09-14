import { httpApiRoutes as routes0 } from "./modules/package-management/http-api.routes";

export const httpApiRouting = {
  roots: ["/installed-packages","/installed-package-reconciliation","/package-settings"],
  routes: { ...routes0 },
} as const;

export const httpApiDocumentation = {
  "sections": {
    "package-management.platform": {
      "title": "Platform",
      "navigationHeadingId": "voyzu.platform",
      "description": "Core Voyzu platform operations.",
      "groups": {
        "package-management.operations": {
          "title": "@voyzu/package-management",
          "description": "Platform operations provided by @voyzu/package-management.",
          "routes": {
            "package-management.package-management.list": {
              "description": "Lists the packages currently recorded as installed in this Voyzu instance."
            },
            "package-management.package-management.get": {
              "description": "Gets one installed package record."
            },
            "package-management.package-management.update": {
              "description": "Controls top-navigation visibility and direct access to an installed package's page routes. HTTP API routes are unaffected."
            },
            "package-management.package-management.move": {
              "description": "Moves a package up or down in top-navigation order."
            },
            "package-management.package-management.refresh": {
              "description": "Reconciles package-management records with packages installed on the filesystem."
            },
            "package-management.package-management.getHomePage": {
              "description": "Gets the application start-page route."
            },
            "package-management.package-management.updateHomePage": {
              "description": "Validates and updates the application start-page route."
            }
          }
        }
      }
    }
  }
} as const;
