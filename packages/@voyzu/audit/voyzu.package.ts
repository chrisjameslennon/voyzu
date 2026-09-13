import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { auditModule } from "./modules/audit/module";
import { commonAuditModule } from "./modules/common/module";
import { AuditDefinition } from "./contracts/audit.definition";

export const voyzuAuditPackage = {
  contracts: {
    internalApi: {
      implements: { ...auditModule.implements },
      defines: { "@core/audit": AuditDefinition },
    },
  },
  modules: [auditModule, commonAuditModule],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuditPackage;
