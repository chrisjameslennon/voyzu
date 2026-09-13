import type { InternalApiDefinition, InternalApiImplementationLoader } from "./internal-api";

export interface PackageContracts {
  internalApi?: {
    defines?: Readonly<Record<string, InternalApiDefinition>>;
    implements?: Readonly<Record<string, InternalApiImplementationLoader>>;
    /** Platform combines independently implemented contributions. */
    composes?: Readonly<Record<string, InternalApiImplementationLoader>>;
  };
}
