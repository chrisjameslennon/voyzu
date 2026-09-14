import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { httpApiReferenceModule } from "./modules/http-api-reference/module";

export const httpApiReferencePackage = {
  contracts: { httpApiRouting, httpApiDocumentation },
  modules: [httpApiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default httpApiReferencePackage;
