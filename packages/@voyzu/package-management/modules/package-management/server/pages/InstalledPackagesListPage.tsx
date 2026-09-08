import "server-only";

import { capabilities } from "@voyzu/capability/contracts";

import { InstalledPackageList } from "../../client";
import { getHomePageRoute, listInstalledPackages } from "../lib/installed-package.service";

export async function InstalledPackagesListPage() {
  const canManage = (await capabilities.use("platform.identity").current({})).permissions.includes("users.manage");
  return (
    <InstalledPackageList
      pageTitle="Installed Packages"
      canManage={canManage}
      initialPackages={canManage ? await listInstalledPackages() : []}
      initialHomePageRoute={canManage ? await getHomePageRoute() : "/welcome"}
    />
  );
}
