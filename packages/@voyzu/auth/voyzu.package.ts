import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";

export const voyzuAuthPackage = {
  contracts: {
    implements: {
      masterData: {
        "platform.user": {
          get: (code: string) => import("./modules/users/server/lib/user.service").then((module) => module.getUser(code)),
          list: () => import("./modules/users/server/lib/user.service").then((module) => module.listUsers()),
        },
      },
      capabilities: {
        "platform.identity": {
          load: () => import("./modules/users/server/lib/identity-provider").then(({ current, lookup }) => ({ current, lookup })),
        },
      },
    },
  },
  modules: [authModule, usersModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuthPackage;
