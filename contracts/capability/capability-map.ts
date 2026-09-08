import { transactionalEmailCapability } from "./transactional-email";
import { identityCapability } from "./identity";
import { organizationDirectoryCapability } from "./organization-directory";
export const capabilityContracts = {
  "platform.transactional-email": transactionalEmailCapability,
  "platform.identity": identityCapability,
  "platform.organization-directory": organizationDirectoryCapability,
} as const;
