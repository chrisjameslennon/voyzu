import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as authPageRoutes } from "./modules/auth/pages.routes";
import { pageRoutes as usersPageRoutes } from "./modules/users/pages.routes";
import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";
import { AuthDefinition } from "./contracts/auth.definition";
import { UserDefinition } from "./contracts/user.definition";

export const voyzuAuthPackage = {
  contracts: {
    pageRouting: {
      roots: ["/login", "/settings/users"],
      routes: mergePageRoutes(
        authPageRoutes,
        usersPageRoutes,
      ),
    },
    httpApiRouting,
    httpApiDocumentation,
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
