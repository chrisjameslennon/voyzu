import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { auditModule } from "./modules/audit/module";
import { commonAuditModule } from "./modules/common/module";

export const voyzuAuditPackage = {
  modules: [auditModule, commonAuditModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuditPackage;
