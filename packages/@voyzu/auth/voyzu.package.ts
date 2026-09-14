import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";
import { AuthDefinition } from "./contracts/auth.definition";
import { UserDefinition } from "./contracts/user.definition";

export const voyzuAuthPackage = {
  contracts: {
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
