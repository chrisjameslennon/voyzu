import { httpApiRouting, httpApiDocumentation } from "./http-api.contracts";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { defines, implementations } from "./internalApi";

export const voyzuFoundationPackage = {
  modules: [],
  contracts: {
    httpApiRouting,
    httpApiDocumentation, internalApi: { defines, implements: implementations } },
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuFoundationPackage;
