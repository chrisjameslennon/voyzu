import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { pageRoutes } from "./pages.routes";
import { clientComponents } from "./client-components";

export const commonAuditModule = {
  pageRoutes,
  clientComponents,
  apiDefinitions,
} as const satisfies VoyzuPackageModuleDefinition;

export default commonAuditModule;
