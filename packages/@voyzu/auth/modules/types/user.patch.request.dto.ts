import type { UserUpdateRequestDto } from "./user.update.request.dto";

export type UserPatchRequestDto = Partial<Omit<UserUpdateRequestDto, "code" | "status">>;
