import { UserSchema, UserGetRequestDto, UserGetResponseDto, UserListRequestDto, UserListResponseDto, UserGetSummariesRequestDto, UserGetSummariesResponseDto } from "../types/user.internal-api.dto";
export { UserSchema } from "../types/user.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/user. Definition registered by the owning package. Credentials are never returned. Summary lookup is not an authorization check. */

export interface User extends Static<typeof UserSchema> {}

export const UserDefinition = {
  dataDefinition: UserSchema,
  methods: {
    get: {
      input: UserGetRequestDto,
      output: UserGetResponseDto,
    },
    list: {
      input: UserListRequestDto,
      output: UserListResponseDto,
    },
    getSummaries: {
      input: UserGetSummariesRequestDto,
      output: UserGetSummariesResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type UserContract = typeof UserDefinition;
export interface UserMethods {
  get(parameters: Static<typeof UserDefinition.methods.get.input>): Promise<Static<typeof UserDefinition.methods.get.output>>;
  list(parameters: Static<typeof UserDefinition.methods.list.input>): Promise<Static<typeof UserDefinition.methods.list.output>>;
  getSummaries(parameters: Static<typeof UserDefinition.methods.getSummaries.input>): Promise<Static<typeof UserDefinition.methods.getSummaries.output>>;
}
