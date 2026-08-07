import type { AuthUserDto } from "./auth-user.dto";

export interface AuthSessionResponseDto {
  /** Whether the request has an authenticated UI session. */
  authenticated: boolean;
  /** Authenticated user, when a session exists. */
  user?: AuthUserDto | null;
}
