import type { UserPatchRequestDto } from "./user.patch.request.dto";

export interface UserBatchPatchRequestDto extends UserPatchRequestDto {
  code: string;
}
