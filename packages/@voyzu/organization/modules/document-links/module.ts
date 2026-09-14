import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { implementations } from "./internalApi";
export const documentLinksModule = { implements: implementations, pageRoutes: {} } as const satisfies VoyzuPackageModuleDefinition;
