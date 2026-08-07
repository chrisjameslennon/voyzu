import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { systemInfoModule } from "./modules/system-info/module";

export const systemInfoPackage = {
  modules: [systemInfoModule],
} as const satisfies VoyzuPackageDefinition;

export default systemInfoPackage;
