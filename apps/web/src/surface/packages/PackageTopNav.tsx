import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";

import { managedPackageDomains } from "./managedPackageDomains";
import { PackageTopNavClient } from "./PackageTopNavClient";

export async function PackageTopNav({
  domains,
}: {
  domains: VoyzuComposedSurfaceDomain[];
}) {
  const managedDomains = await managedPackageDomains(domains);
  return (
    <PackageTopNavClient
      domains={managedDomains.filter((domain) => domain.topNavigationVisible !== false)}
      allDomains={domains}
    />
  );
}
