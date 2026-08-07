import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { apiReferenceModule } from "./modules/api-reference/module";

export const apiReferencePackage = {
  modules: [apiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default apiReferencePackage;
