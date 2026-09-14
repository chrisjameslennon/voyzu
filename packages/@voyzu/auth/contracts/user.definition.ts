import { UserSchema, UserGetRequestDto, UserGetResponseDto } from "../types/user.internal-api.dto";
export { UserSchema } from "../types/user.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/user. Definition registered by the owning package. Credentials are never returned. */

export interface User extends Static<typeof UserSchema> {}

export const UserDefinition = {
  dataDefinition: UserSchema,
  methods: {
    get: {
      input: UserGetRequestDto,
      output: UserGetResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type UserContract = typeof UserDefinition;
export interface UserMethods {
  get(parameters: Static<typeof UserDefinition.methods.get.input>): Promise<Static<typeof UserDefinition.methods.get.output>>;
}
