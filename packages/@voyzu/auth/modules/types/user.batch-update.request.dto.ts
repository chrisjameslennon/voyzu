import type { UserUpdateRequestDto } from "./user.update.request.dto";

export interface UserBatchUpdateRequestDto extends UserUpdateRequestDto {
  code: string;
}
