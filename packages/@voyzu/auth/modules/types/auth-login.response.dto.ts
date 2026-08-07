import type { AuthUserDto } from "./auth-user.dto";

export interface AuthLoginResponseDto {
  /** Authenticated user. */
  user: AuthUserDto;
}
