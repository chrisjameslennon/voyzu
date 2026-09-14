import type { InternalApiDefinition, InternalApiImplementationLoader } from "./internal-api";
import type { HttpApiRouting, HttpApiDocumentation } from "./http-api/route-definition";

export interface PackageContracts {
  httpApiRouting?: HttpApiRouting;
  httpApiDocumentation?: HttpApiDocumentation;
  internalApi?: {
    defines?: Readonly<Record<string, InternalApiDefinition>>;
    implements?: Readonly<Record<string, InternalApiImplementationLoader>>;
    /** Platform combines independently implemented contributions. */
    composes?: Readonly<Record<string, InternalApiImplementationLoader>>;
  };
}
