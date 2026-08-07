import "server-only";

import { currentUserCanManageUsers } from "@voyzu/auth/users/server";

import { InstalledPackageList } from "../../client";
import { getHomePageRoute, listInstalledPackages } from "../lib/installed-package.service";

export async function InstalledPackagesListPage() {
  const canManage = await currentUserCanManageUsers();
  return (
    <InstalledPackageList
      pageTitle="Installed Packages"
      canManage={canManage}
      initialPackages={canManage ? await listInstalledPackages() : []}
      initialHomePageRoute={canManage ? await getHomePageRoute() : "/welcome"}
    />
  );
}
