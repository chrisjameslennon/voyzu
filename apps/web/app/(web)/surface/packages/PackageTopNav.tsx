import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";
import { listInstalledPackages } from "@voyzu/package-management/server";

import { PackageTopNavClient } from "./PackageTopNavClient";

export async function PackageTopNav({
  domains,
}: {
  domains: VoyzuComposedSurfaceDomain[];
}) {
  let managedDomains = domains;
  try {
    const installedPackages = await listInstalledPackages();
    const settings = new Map(installedPackages.map((item) => [item.code, item]));
    managedDomains = domains
      .filter((domain) => settings.get(domain.packageName)?.status !== "INACTIVE")
      .sort((left, right) => {
        const leftOrder = settings.get(left.packageName)?.navOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = settings.get(right.packageName)?.navOrder ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder;
      });
  } catch (error) {
    if ((error as { code?: string }).code !== "42P01") throw error;
  }

  return <PackageTopNavClient domains={managedDomains} />;
}
