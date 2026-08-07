import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";

import { managedPackageDomains } from "./managedPackageDomains";
import { PackageTopNavClient } from "./PackageTopNavClient";

export async function PackageTopNav({
  domains,
}: {
  domains: VoyzuComposedSurfaceDomain[];
}) {
  return <PackageTopNavClient domains={await managedPackageDomains(domains)} />;
}
