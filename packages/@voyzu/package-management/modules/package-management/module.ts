import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { pageRoutes } from "./pages.routes";
import { defines, implementations } from "./internalApi";

export const packageManagementModule = {
  defines,
  implements: implementations,
  pageRoutes } as const satisfies VoyzuPackageModuleDefinition;

export default packageManagementModule;
