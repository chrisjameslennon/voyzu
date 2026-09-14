import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { defines, implementations } from "./internalApi";

export const voyzuFoundationPackage = {
  modules: [],
  contracts: { internalApi: { defines, implements: implementations } },
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuFoundationPackage;
