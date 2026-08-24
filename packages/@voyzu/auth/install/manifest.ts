export const install = {
  sql: [
    "./install/db/sql/app-user.sql",
  ],
  seedSql: [
    "./install/db/seed/admin-user.seed.sql",
  ],
} as const;
