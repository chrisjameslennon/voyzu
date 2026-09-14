import { httpApiRoutes as routes0 } from "./modules/auth/http-api.routes";
import { httpApiRoutes as routes1 } from "./modules/users/http-api.routes";
import { pageRoutes as authPageRoutes } from "./modules/auth/pages.routes";
import { pageRoutes as usersPageRoutes } from "./modules/users/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";
import { AuthDefinition } from "./contracts/auth.definition";
import { UserDefinition } from "./contracts/user.definition";

export const voyzuAuthPackage = {
  contracts: {
    pageRouting: {
      roots: {
        "/login": {
          routes: authPageRoutes,
        },
        "/settings/users": {
          routes: usersPageRoutes,
        },
      },
    },
    httpApiRouting: {
      roots: ["/auth","/users","/user-queries","/user-search-results","/user-selections","/user-batches"],
      routes: { ...routes0, ...routes1 },
    },
    httpApiDocumentation: {
      "sections": {
        "auth.platform": {
          "title": "Platform",
          "navigationHeadingId": "voyzu.platform",
          "description": "Core Voyzu platform operations.",
          "groups": {
            "auth.operations": {
              "title": "@voyzu/auth",
              "description": "Platform operations provided by @voyzu/auth.",
              "routes": [
                "auth.auth.login",
                "auth.auth.logout",
                "auth.auth.me",
                "auth.users.getOrganizationAccess",
                "auth.users.replaceOrganizationAccess",
                "auth.users.list",
                "auth.users.create",
                "auth.users.filter",
                "auth.users.search",
                "auth.users.batchGet",
                "auth.users.batchCreate",
                "auth.users.batchUpdate",
                "auth.users.batchPatch",
                "auth.users.profile",
                "auth.users.updateProfile",
                "auth.users.profilePassword",
                "auth.users.get",
                "auth.users.update",
                "auth.users.patch",
                "auth.users.delete",
                "auth.users.activate",
                "auth.users.deactivate",
                "auth.users.changePassword",
                "auth.users.batchActivate",
                "auth.users.batchDeactivate",
                "auth.users.batchDelete"
              ]
            }
          }
        }
      }
    },
    internalApi: {
      implements: { ...usersModule.implements },
      defines: {
        "@core/auth": AuthDefinition,
        "@core/user": UserDefinition,
      },
    },

  },
  modules: [authModule, usersModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuthPackage;
