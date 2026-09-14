import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { welcomeModule } from "./modules/welcome/module";

export const welcomePackage = {
  contracts: { httpApiRouting, httpApiDocumentation },
  modules: [welcomeModule],
} as const satisfies VoyzuPackageDefinition;

export default welcomePackage;
