import Type from "typebox";
import { UserUpdateRequestDto } from "./user.update.request.dto";

export const UserPatchRequestDto = Type.Partial(Type.Omit(UserUpdateRequestDto, ["code", "status"]), { additionalProperties: false });
export type UserPatchRequestDto = Type.Static<typeof UserPatchRequestDto>;
