import type { VoyzuApiConfig } from "@voyzu/api";
import { capabilityModule } from "@voyzu/api/capability-module";
import { voyzuAuthPackage } from "@voyzu/auth/voyzu-package";
import { voyzuAuditPackage } from "@voyzu/audit/voyzu-package";
import { welcomePackage } from "@voyzu/welcome/voyzu-package";
import { voyzuPackageManagementPackage } from "@voyzu/package-management/voyzu-package";

import { composedApiModules } from "../../../../generated-composition/packages.generated";
import validationSchemas from "../generated-files/api-validation.generated.json";

export const voyzuApiConfig = {
  basePath: "/api",
  modules: [
    ...voyzuAuthPackage.modules,
    ...voyzuAuditPackage.modules,
    ...welcomePackage.modules,
    ...voyzuPackageManagementPackage.modules,
    capabilityModule,
    ...composedApiModules,
  ],
  validationSchemas,
} satisfies VoyzuApiConfig;
