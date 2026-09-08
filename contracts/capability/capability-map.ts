import { transactionalEmailCapability } from "./transactional-email";
import { identityCapability } from "./identity";
export const capabilityContracts = { "platform.transactional-email": transactionalEmailCapability, "platform.identity": identityCapability } as const;
