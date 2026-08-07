import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

export const voyzuFoundationPackage = {
  modules: [],
  install: {
    sql: [
      "./install/db/sql/platform-domains.sql",
      "./install/db/sql/voyzu-settings.sql",
    ],
  },
} as const satisfies VoyzuPackageDefinition;

export default voyzuFoundationPackage;
