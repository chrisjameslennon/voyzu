import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { authModule } from "./modules/auth/module";
import { usersModule } from "./modules/users/module";

export const voyzuAuthPackage = {
  modules: [authModule, usersModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuthPackage;
