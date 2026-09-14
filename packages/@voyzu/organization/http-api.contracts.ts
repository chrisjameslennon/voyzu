import { httpApiRoutes as routes0 } from "./modules/organization-access/http-api.routes";
import { httpApiRoutes as routes1 } from "./modules/organization-switcher/http-api.routes";
import { httpApiRoutes as routes2 } from "./modules/organizations/http-api.routes";

export const httpApiRouting = {
  roots: ["/organization","/organization-selection"],
  routes: { ...routes0, ...routes1, ...routes2 },
} as const;

export const httpApiDocumentation = {
  "sections": {
    "organization.platform": {
      "title": "Platform",
      "navigationHeadingId": "voyzu.platform",
      "description": "Core Voyzu platform operations.",
      "groups": {
        "organization.operations": {
          "title": "@voyzu/organization",
          "description": "Platform operations provided by @voyzu/organization.",
          "routes": {
            "organization.organization-access.list": {
              "description": "Lists standard users, organizations and current organization assignments."
            },
            "organization.organization-access.replace": {
              "description": "Replaces all organization assignments for a standard user."
            },
            "organization.organization-switcher.getSelection": {
              "description": "Get Selection Organization Switcher."
            },
            "organization.organization-switcher.setSelection": {
              "description": "Set Selection Organization Switcher."
            },
            "organization.organization-switcher.accessArchivedSelection": {
              "description": "Select an accessible archived organization without adding it to the active organization switcher."
            },
            "organization.organizations.updateFinance": {
              "description": "Updates Finance settings through the shared internal API. Finance must be installed and the organization active."
            },
            "organization.organizations.list": {
              "description": "Returns all organizations in the system."
            },
            "organization.organizations.create": {
              "description": "Creates a new organization record. Status defaults to ACTIVE and cannot be supplied in the request body."
            },
            "organization.organizations.filter": {
              "description": "Returns organizations matching the supplied filter criteria."
            },
            "organization.organizations.search": {
              "description": "Full-text search across organizations using the query string parameter."
            },
            "organization.organizations.batchCreate": {
              "description": "Creates multiple organization records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back."
            },
            "organization.organizations.batchGet": {
              "description": "Retrieves multiple organizations by a list of business codes."
            },
            "organization.organizations.batchUpdate": {
              "description": "Fully replaces multiple organization records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back."
            },
            "organization.organizations.batchPatch": {
              "description": "Partially updates multiple organization records in a single request. Executed as a single database transaction; if any item fails, all changes are rolled back."
            },
            "organization.organizations.batchDelete": {
              "description": "Permanently deletes multiple organizations and all organization-owned financial records by their business codes."
            },
            "organization.organizations.batchActivate": {
              "description": "Sets multiple organizations to ACTIVE."
            },
            "organization.organizations.batchDeactivate": {
              "description": "Sets multiple organizations to INACTIVE."
            },
            "organization.organizations.activate": {
              "description": "Sets an organization to ACTIVE."
            },
            "organization.organizations.deactivate": {
              "description": "Sets an organization to INACTIVE."
            },
            "organization.organizations.get": {
              "description": "Retrieves a single organization by its business code."
            },
            "organization.organizations.update": {
              "description": "Fully replaces an organization record with the supplied data."
            },
            "organization.organizations.patch": {
              "description": "Partially updates an organization record. Only the fields provided are changed."
            },
            "organization.organizations.delete": {
              "description": "Permanently deletes an organization and all organization-owned financial records by its business code."
            }
          }
        }
      }
    }
  }
} as const;
