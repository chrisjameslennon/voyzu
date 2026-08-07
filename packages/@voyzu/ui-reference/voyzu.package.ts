import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { uiReferenceModule } from "./modules/ui-reference/module";

export const uiReferencePackage = {
  modules: [uiReferenceModule],
} as const satisfies VoyzuPackageDefinition;

export default uiReferencePackage;
