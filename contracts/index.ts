import { capabilityContracts } from "./capability/capability-map";
import { masterDataContracts } from "./master-data/master-data-map";
export const platformContracts = { defines: { capabilities: capabilityContracts, masterData: masterDataContracts } } as const;
