import { capabilityContracts } from "./capability/capability-map";
export const platformContracts = { defines: { capabilities: capabilityContracts } } as const;
