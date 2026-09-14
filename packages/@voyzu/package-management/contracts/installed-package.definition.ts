import type { InternalApiDefinition } from "@voyzu/types/internal-api";
import { InstalledPackageResponseDto } from "../types";
import { InstalledPackageGetRequestDto, InstalledPackageGetResponseDto } from "../types/installed-package.internal-api.dto";
export const InstalledPackageDefinition = {
  dataDefinition: InstalledPackageResponseDto,
  methods: { get: { input: InstalledPackageGetRequestDto, output: InstalledPackageGetResponseDto } },
} as const satisfies InternalApiDefinition;
