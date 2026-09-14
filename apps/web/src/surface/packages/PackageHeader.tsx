"use client";

import type { UiSurfaceHeaderProps } from "@voyzu/types/ui-surface";
import { PackageLeftNavHeader as PreinstalledHeader, hasPackageLeftNavHeader as hasPreinstalledHeader } from "../../../.generated/navigation/pre-installed-headers";
import { PackageLeftNavHeader as InstalledHeader } from "../../../.generated/navigation/installed-headers";

export function PackageHeader(props: UiSurfaceHeaderProps & { packageName: string; rootPath: string }) {
  return hasPreinstalledHeader(props.packageName, props.rootPath) ? <PreinstalledHeader {...props} /> : <InstalledHeader {...props} />;
}
