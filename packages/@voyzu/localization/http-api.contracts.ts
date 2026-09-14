import { httpApiRoutes as routes0 } from "./modules/countries/http-api.routes";
import { httpApiRoutes as routes1 } from "./modules/currencies/http-api.routes";

export const httpApiRouting = {
  roots: ["/localization"],
  routes: { ...routes0, ...routes1 },
} as const;

export const httpApiDocumentation = {
  "sections": {
    "localization.platform": {
      "title": "Platform",
      "navigationHeadingId": "voyzu.platform",
      "description": "Core Voyzu platform operations.",
      "groups": {
        "localization.operations": {
          "title": "@voyzu/localization",
          "description": "Platform operations provided by @voyzu/localization.",
          "routes": {
            "localization.countries.list": {
              "description": "Lists countries."
            },
            "localization.countries.create": {
              "description": "Creates a country. Status defaults to ACTIVE and cannot be supplied in the request body."
            },
            "localization.countries.filter": {
              "description": "Filters countries using the shared filter request body."
            },
            "localization.countries.search": {
              "description": "Searches countries."
            },
            "localization.countries.batchCreate": {
              "description": "Creates multiple countries. Status defaults to ACTIVE and cannot be supplied in the request body."
            },
            "localization.countries.batchGet": {
              "description": "Gets multiple countries by code."
            },
            "localization.countries.batchUpdate": {
              "description": "Updates multiple countries. Status cannot be changed by this request; code identifies each row."
            },
            "localization.countries.batchPatch": {
              "description": "Patches multiple countries. Status cannot be changed by this request; code identifies each row."
            },
            "localization.countries.batchDelete": {
              "description": "Deletes multiple countries. Countries with postings cannot be deleted."
            },
            "localization.countries.batchActivate": {
              "description": "Sets multiple countries to ACTIVE."
            },
            "localization.countries.batchDeactivate": {
              "description": "Sets multiple countries to INACTIVE."
            },
            "localization.countries.get": {
              "description": "Gets a country."
            },
            "localization.countries.update": {
              "description": "Updates a country. Status and code cannot be changed by this request."
            },
            "localization.countries.patch": {
              "description": "Patches a country. Status and code cannot be changed by this request."
            },
            "localization.countries.delete": {
              "description": "Deletes a country. Countries with postings cannot be deleted."
            },
            "localization.countries.activate": {
              "description": "Sets a country to ACTIVE."
            },
            "localization.countries.deactivate": {
              "description": "Sets a country to INACTIVE."
            },
            "localization.currencies.list": {
              "description": "List Currencies."
            },
            "localization.currencies.create": {
              "description": "Create Currencies. Status defaults to ACTIVE and cannot be supplied in the request body."
            },
            "localization.currencies.filter": {
              "description": "Filter Currencies."
            },
            "localization.currencies.search": {
              "description": "Search Currencies."
            },
            "localization.currencies.get": {
              "description": "Get Currencies."
            },
            "localization.currencies.update": {
              "description": "Update Currencies."
            },
            "localization.currencies.patch": {
              "description": "Patch Currencies."
            },
            "localization.currencies.delete": {
              "description": "Delete Currencies."
            },
            "localization.currencies.batchCreate": {
              "description": "Creates multiple currencies. Status defaults to ACTIVE and cannot be supplied in the request body."
            },
            "localization.currencies.batchGet": {
              "description": "Gets multiple currencies by code."
            },
            "localization.currencies.batchUpdate": {
              "description": "Updates multiple currencies. Status and code cannot be changed by this request; code identifies each row."
            },
            "localization.currencies.batchPatch": {
              "description": "Patches multiple currencies. Status and code cannot be changed by this request; code identifies each row."
            },
            "localization.currencies.batchDelete": {
              "description": "Deletes multiple currencies. Currencies with postings cannot be deleted."
            },
            "localization.currencies.activate": {
              "description": "Sets a currency to ACTIVE."
            },
            "localization.currencies.deactivate": {
              "description": "Sets a currency to INACTIVE."
            },
            "localization.currencies.batchActivate": {
              "description": "Sets multiple currencies to ACTIVE."
            },
            "localization.currencies.batchDeactivate": {
              "description": "Sets multiple currencies to INACTIVE."
            }
          }
        }
      }
    }
  }
} as const;
