import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { uiReferenceModule } from "./modules/ui-reference/module";

export const uiReferencePackage = {
  contracts: { httpApiRouting, httpApiDocumentation },
  modules: [uiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default uiReferencePackage;
