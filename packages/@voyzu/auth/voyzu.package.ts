import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";

export const voyzuAuthPackage = {
  contracts: {
    semanticDataDefinition: {
      implements: {
        user: {
          get: (code: string) => import("./modules/users/server/lib/user.service").then(m => m.getUser(code)),
          queries: { all: (_input: Record<string, never>) => import("./modules/users/server/lib/user.service").then(m => m.listUsers()) },
        },
        userSummary: {
          get: (id: number) => import("./modules/users/server/lib/identity-provider").then(async m => (await m.lookup({ ids: [id] })).users[0] ?? null),
          queries: { byIds: (input: { ids: number[] }) => import("./modules/users/server/lib/identity-provider").then(async m => (await m.lookup(input)).users) },
        },
      },
    },
    semanticCapabilityDefinition: {
      implements: {
        "platform.identity": {
          getCurrentIdentity: (_input: Record<string, never>) => import("./modules/users/server/lib/identity-provider").then(m => m.current()),
        },
      },
    },
  },
  modules: [authModule, usersModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuthPackage;
