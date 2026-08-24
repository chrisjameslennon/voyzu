import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { events } from "./events";
import { pageRoutes } from "./pages.routes";
import { operations } from "./operations";

export const usersModule = {
  pageRoutes,
  apiDefinitions,
  operations,
  events,
} as const satisfies VoyzuPackageModuleDefinition;

export default usersModule;
