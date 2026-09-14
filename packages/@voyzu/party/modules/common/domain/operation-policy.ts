import type { OperationBlocker } from "@voyzu/types/modules/core";

export type { OperationBlocker } from "@voyzu/types/modules/core";

export interface LinkedReference {
  type: string;
  code: string;
}

interface OperationState {
  code: string;
  hasPostings?: boolean;
  linkedBy?: readonly LinkedReference[];
}

export function Deactivation(current: OperationState, partyName: string): OperationBlocker[] {
  if (!current.linkedBy?.length) return [];
  return [{
    code: "LINKED_RECORD_CANNOT_BE_DEACTIVATED",
    message: `${partyName} ${current.code} is linked to and cannot be deactivated`,
  }];
}

export function Deletion(
  current: OperationState,
  partyName: string,
  options: { blockWhenHasPostings?: boolean } = {},
): OperationBlocker[] {
  const blockers: OperationBlocker[] = [];
  if (options.blockWhenHasPostings && current.hasPostings) {
    blockers.push({
      code: "HAS_POSTINGS_CANNOT_BE_DELETED",
      message: `${partyName} ${current.code} has postings and cannot be deleted`,
    });
  }
  if (current.linkedBy?.length) {
    blockers.push({
      code: "LINKED_RECORD_CANNOT_BE_DELETED",
      message: `${partyName} ${current.code} is linked to and cannot be deleted`,
    });
  }
  return blockers;
}
