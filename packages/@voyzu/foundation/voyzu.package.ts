import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";

export const voyzuFoundationPackage = {
  modules: [],
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuFoundationPackage;
