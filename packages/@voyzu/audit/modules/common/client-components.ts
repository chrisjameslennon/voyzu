import type { VoyzuClientComponentDefinition } from "@voyzu/ui-surface/types";

export const clientComponents = {
  auditPanel: {
    id: "audit.panel",
    loadComponent: () => import("./client/AuditPanel").then((module) => module.AuditPanel),
  },
} as const satisfies Record<string, VoyzuClientComponentDefinition>;
