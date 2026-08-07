import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { auditModule } from "./modules/audit/module";
import { commonAuditModule } from "./modules/common/module";

export const voyzuAuditPackage = {
  modules: [auditModule, commonAuditModule],
  install: {
    sql: [
      "./install/db/sql/audit-event.sql",
      "./install/db/sql/audit-change.sql",
      "./install/db/sql/audit-trigger.sql",
      "./install/db/sql/auth-audit-triggers.sql",
    ],
  },
} as const satisfies VoyzuPackageDefinition;

export default voyzuAuditPackage;
