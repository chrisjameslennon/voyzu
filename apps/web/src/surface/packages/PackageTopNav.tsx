import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";

import { managedPackageDomains } from "./managedPackageDomains";
import { PackageTopNavClient } from "./PackageTopNavClient";

const IMPLEMENTER_APPLICATIONS = new Set(["@voyzu/api-reference", "@voyzu/ui-reference"]);

export async function PackageTopNav({
  domains,
}: {
  domains: VoyzuComposedSurfaceDomain[];
}) {
  const managedDomains = await managedPackageDomains(domains);
  return (
    <PackageTopNavClient
      domains={managedDomains.filter((domain) =>
        domain.topNavigationVisible !== false
        && !IMPLEMENTER_APPLICATIONS.has(domain.packageName)
      )}
      allDomains={domains}
    />
  );
}
