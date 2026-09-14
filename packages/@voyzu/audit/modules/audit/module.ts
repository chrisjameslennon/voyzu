import { implementations } from "./internalApi";
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { pageRoutes } from "./pages.routes";

export const auditModule = {
  implements: implementations,
  pageRoutes } as const satisfies VoyzuPackageModuleDefinition;

export default auditModule;
