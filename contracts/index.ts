import { capabilityContracts } from "./capability/capability-map";
import { semanticDataContracts } from "./master-data/master-data-map";
export const platformContracts = {
  semanticCapabilityDefinition: { defines: capabilityContracts },
  semanticDataDefinition: { defines: semanticDataContracts },
} as const;
