export interface AuthLoginRequestDto {
  /** User code, email address, or other configured login identifier. */
  identifier: string;
  /** User password. */
  password: string;
}
