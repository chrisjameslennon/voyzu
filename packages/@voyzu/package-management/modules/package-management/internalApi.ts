import { InstalledPackageDefinition } from "../../contracts/installed-package.definition";

export const defines = { "@core/installed-package": InstalledPackageDefinition };
export const implementations = {
  "@core/installed-package": () => import("./server/lib/installed-package.implementation").then(module => ({ methods: module.installedPackageMethods })),
};
