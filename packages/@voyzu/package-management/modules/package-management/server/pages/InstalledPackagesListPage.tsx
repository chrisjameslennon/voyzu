import "server-only";

import { internalApi } from "@voyzu/capability/internal-api";

import { InstalledPackageList } from "../../client";
import { getHomePageRoute, listInstalledPackages } from "../lib/installed-package.service";

export async function InstalledPackagesListPage() {
  const canManage = (await internalApi.call("@core/auth", "get", {})).permissions.includes("users.manage");
  return (
    <InstalledPackageList
      pageTitle="Installed Packages"
      canManage={canManage}
      initialPackages={canManage ? await listInstalledPackages() : []}
      initialHomePageRoute={canManage ? await getHomePageRoute() : "/welcome"}
    />
  );
}
