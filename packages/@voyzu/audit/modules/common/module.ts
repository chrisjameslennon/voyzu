import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

/** Shared audit actor, stamping, and presentation capability. */
export const commonAuditModule = {
  pageRoutes: {},
  apiDefinitions: {},
} as const satisfies VoyzuPackageModuleDefinition;

export default commonAuditModule;
