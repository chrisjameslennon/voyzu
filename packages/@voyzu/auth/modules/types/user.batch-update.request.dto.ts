import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserUpdateRequestDto } from "./user.update.request.dto";
import { UserCode } from "./user.fields";

export const UserBatchUpdateRequestDto = StrictObject({ ...UserUpdateRequestDto.properties, code: UserCode });
export type UserBatchUpdateRequestDto = Type.Static<typeof UserBatchUpdateRequestDto>;
