import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { systemInfoModule } from "./modules/system-info/module";

export const systemInfoPackage = {
  contracts: { httpApiRouting, httpApiDocumentation },
  modules: [systemInfoModule],
} as const satisfies VoyzuPackageDefinition;

export default systemInfoPackage;
