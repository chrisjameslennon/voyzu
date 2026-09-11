import { StrictObject } from "@voyzu/types/api";
import { CurrentIdentity } from "@voyzu/types/identity";
export const identityCapability = {
  getCurrentIdentity: { input: StrictObject({}), output: CurrentIdentity },
} as const;
