import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { pageRoutes } from "./pages.routes";
import { commands } from "./commands";

export const auditModule = {
  pageRoutes,
  apiDefinitions,
  commands,
} as const satisfies VoyzuPackageModuleDefinition;

export default auditModule;
