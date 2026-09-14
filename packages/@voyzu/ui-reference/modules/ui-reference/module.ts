import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { pageRoutes } from "./pages.routes";

export const uiReferenceModule = {
  pageRoutes } as const satisfies VoyzuPackageModuleDefinition;

export default uiReferenceModule;
