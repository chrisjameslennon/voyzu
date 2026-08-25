import type { VoyzuApiConfig } from "@voyzu/api";
import { capabilityModule } from "@voyzu/api/capability-module";
import { apiReferencePackage } from "@voyzu/api-reference/voyzu-package";
import { voyzuAuthPackage } from "@voyzu/auth/voyzu-package";
import { voyzuAuditPackage } from "@voyzu/audit/voyzu-package";
import { voyzuLocalizationPackage } from "@voyzu/localization/voyzu-package";
import { voyzuPackageManagementPackage } from "@voyzu/package-management/voyzu-package";
import { systemInfoPackage } from "@voyzu/system-info/voyzu-package";
import { uiReferencePackage } from "@voyzu/ui-reference/voyzu-package";
import { welcomePackage } from "@voyzu/welcome/voyzu-package";

import { installedPackageApiModules } from "../../.generated/navigation/packages";

export const voyzuApiConfig = {
  basePath: "/api",
  modules: [
    ...voyzuAuthPackage.modules,
    ...voyzuAuditPackage.modules,
    ...voyzuLocalizationPackage.modules,
    ...welcomePackage.modules,
    ...voyzuPackageManagementPackage.modules,
    ...systemInfoPackage.modules,
    ...uiReferencePackage.modules,
    ...apiReferencePackage.modules,
    capabilityModule,
    ...installedPackageApiModules,
  ],
} satisfies VoyzuApiConfig;
