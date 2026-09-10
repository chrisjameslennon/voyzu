import { identityCapability } from "./identity";
import { organizationDirectoryCapability } from "./organization-directory";
export const capabilityContracts = {
  "platform.identity": identityCapability,
  "platform.organization-directory": organizationDirectoryCapability,
} as const;
