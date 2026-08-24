export const install = {
  sql: [
    "./install/db/objects/localization-domains.sql",
    "./install/db/objects/table.currency.create.sql",
    "./install/db/objects/table.country.create.sql",
    "./install/db/objects/audit-triggers.attach.sql",
  ],
  seedSql: [
    "./install/db/seed/currency.seed.sql",
    "./install/db/seed/country.seed.sql",
  ],
} as const;
