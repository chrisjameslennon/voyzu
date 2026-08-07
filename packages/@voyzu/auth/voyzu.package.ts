import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";

export const voyzuAuthPackage = {
  modules: [authModule, usersModule],
  install: {
    sql: [
      "./install/db/sql/app-user.sql",
    ],
    seedSql: [
      "./install/db/seed/admin-user.seed.sql",
    ],
  },
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuthPackage;
