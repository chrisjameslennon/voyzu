import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserPatchRequestDto } from "./user.patch.request.dto";
import { UserCode } from "./user.fields";

export const UserBatchPatchRequestDto = StrictObject({ ...UserPatchRequestDto.properties, code: UserCode });
export type UserBatchPatchRequestDto = Type.Static<typeof UserBatchPatchRequestDto>;
