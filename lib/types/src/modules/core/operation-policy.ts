/**
 * A business rule preventing an operation from proceeding.
 */
export interface OperationBlocker {
  /** Stable machine-readable blocker code. */
  code: string;
  /** Human-readable explanation of the blocker. */
  message: string;
}
