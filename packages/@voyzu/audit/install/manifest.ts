export const install = {
  sql: [
    "./install/db/sql/audit-event.sql",
    "./install/db/sql/audit-change.sql",
    "./install/db/sql/audit-trigger.sql",
    "./install/db/sql/auth-audit-triggers.sql",
  ],
} as const;
