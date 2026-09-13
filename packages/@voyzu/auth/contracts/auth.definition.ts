import { AuthSchema, AuthGetCurrentIdentityRequestDto } from "../types/auth.internal-api.dto";
export { AuthSchema } from "../types/auth.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/auth. Definition registered by the owning package. Current request identity, including permissions; user may be null. */

export interface Auth extends Static<typeof AuthSchema> {}

export const AuthDefinition = {
  dataDefinition: AuthSchema,
  methods: {
    getCurrentIdentity: {
      input: AuthGetCurrentIdentityRequestDto,
      output: AuthSchema,
    },
  },
} as const satisfies InternalApiDefinition;

export type AuthContract = typeof AuthDefinition;
export interface AuthMethods {
  getCurrentIdentity(parameters: Static<typeof AuthDefinition.methods.getCurrentIdentity.input>): Promise<Static<typeof AuthDefinition.methods.getCurrentIdentity.output>>;
}
