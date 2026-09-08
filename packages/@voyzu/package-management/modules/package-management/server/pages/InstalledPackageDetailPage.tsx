import "server-only";

import { notFound } from "next/navigation";
import { getSingletonHighlighter } from "shiki";

import { capabilities } from "@voyzu/capability/contracts";

import { InstalledPackageDetail } from "../../client";
import { getInstalledPackage } from "../lib/installed-package.service";
import { readInstalledPackageFiles } from "../lib/package-inventory";

export async function InstalledPackageDetailPage({ id }: { id?: string }) {
  if (!id) notFound();
  const canManage = (await capabilities.use("platform.identity").current({})).permissions.includes("users.manage");
  const installedPackage = canManage
    ? await getInstalledPackage(Number(id))
    : null;
  if (canManage && !installedPackage) notFound();
  const packageFiles = installedPackage
    ? await readInstalledPackageFiles(installedPackage.code)
    : null;
  const formattedPackageFiles = packageFiles
    ? await (async () => {
        const highlighter = await getSingletonHighlighter({
          themes: ["dark-plus"],
          langs: ["json", "typescript"],
        });
        return {
          ...packageFiles,
          packageJsonHtml: highlighter.codeToHtml(packageFiles.packageJson, {
            lang: "json",
            theme: "dark-plus",
          }),
          packageDefinitionHtml: highlighter.codeToHtml(packageFiles.packageDefinition, {
            lang: "typescript",
            theme: "dark-plus",
          }),
        };
      })()
    : null;
  return (
    <InstalledPackageDetail
      pageTitle="Installed Packages"
      canManage={canManage}
      installedPackage={installedPackage}
      packageFiles={formattedPackageFiles}
    />
  );
}
