import { httpApiRoutes as routes0 } from "./modules/auth/http-api.routes";
import { httpApiRoutes as routes1 } from "./modules/users/http-api.routes";

export const httpApiRouting = {
  roots: ["/auth","/users","/user-queries","/user-search-results","/user-selections","/user-batches"],
  routes: { ...routes0, ...routes1 },
} as const;

export const httpApiDocumentation = {
  "sections": {
    "auth.platform": {
      "title": "Platform",
      "navigationHeadingId": "voyzu.platform",
      "description": "Core Voyzu platform operations.",
      "groups": {
        "auth.operations": {
          "title": "@voyzu/auth",
          "description": "Platform operations provided by @voyzu/auth.",
          "routes": {
            "auth.auth.login": {
              "description": "Authenticates a UI user and creates an authenticated session cookie."
            },
            "auth.auth.logout": {
              "description": "Clears the authenticated UI session cookie."
            },
            "auth.auth.me": {
              "description": "Returns the current UI authentication session state."
            },
            "auth.users.getOrganizationAccess": {
              "description": "Gets the user's organization assignments and available organizations."
            },
            "auth.users.replaceOrganizationAccess": {
              "description": "Replaces all organization assignments for a standard user through the Organization internal API."
            },
            "auth.users.list": {
              "description": "List Users."
            },
            "auth.users.create": {
              "description": "Create Users."
            },
            "auth.users.filter": {
              "description": "Filter Users."
            },
            "auth.users.search": {
              "description": "Search Users."
            },
            "auth.users.batchGet": {
              "description": "Batch Get Users."
            },
            "auth.users.batchCreate": {
              "description": "Batch Create Users."
            },
            "auth.users.batchUpdate": {
              "description": "Batch Update Users."
            },
            "auth.users.batchPatch": {
              "description": "Batch Patch Users."
            },
            "auth.users.profile": {
              "description": "Profile Users."
            },
            "auth.users.updateProfile": {
              "description": "Update Profile Users."
            },
            "auth.users.profilePassword": {
              "description": "Profile Password Users."
            },
            "auth.users.get": {
              "description": "Get Users."
            },
            "auth.users.update": {
              "description": "Update Users."
            },
            "auth.users.patch": {
              "description": "Patch Users."
            },
            "auth.users.delete": {
              "description": "Delete Users."
            },
            "auth.users.activate": {
              "description": "Activate Users."
            },
            "auth.users.deactivate": {
              "description": "Deactivate Users."
            },
            "auth.users.changePassword": {
              "description": "Change Password Users."
            },
            "auth.users.batchActivate": {
              "description": "Batch Activate Users."
            },
            "auth.users.batchDeactivate": {
              "description": "Batch Deactivate Users."
            },
            "auth.users.batchDelete": {
              "description": "Batch Delete Users."
            }
          }
        }
      }
    }
  }
} as const;
