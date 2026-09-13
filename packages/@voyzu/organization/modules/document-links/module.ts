import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { implementations } from "./internalApi";
export const documentLinksModule = { implements: implementations, pageRoutes: {}, apiDefinitions: {} } as const satisfies VoyzuPackageModuleDefinition;
