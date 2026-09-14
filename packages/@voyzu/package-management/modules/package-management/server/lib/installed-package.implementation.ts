import type { Static } from "typebox";
import type { InstalledPackageGetRequestDto, InstalledPackageGetResponseDto } from "../../../../types/installed-package.internal-api.dto";
import { getInstalledPackage } from "./installed-package.service";

export const installedPackageMethods = {
  get({ id }: Static<typeof InstalledPackageGetRequestDto>): Promise<Static<typeof InstalledPackageGetResponseDto>> {
    return getInstalledPackage(id);
  },
};
