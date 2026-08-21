import type { OperationBlocker } from "@voyzu/organization/types/modules/core";

export type { OperationBlocker } from "@voyzu/organization/types/modules/core";

export interface LinkedReference {
  type: string;
  code: string;
}

export interface OperationState {
  code: string;
  hasPostings?: boolean;
  linkedBy?: readonly LinkedReference[];
}

export function CodeChange(
  current: OperationState,
  proposedCode: string,
  entityName: string,
): OperationBlocker[] {
  if (proposedCode === current.code) return [];
  return CodeChangeAvailability(current, entityName);
}

export function CodeChangeAvailability(
  current: OperationState,
  entityName: string,
): OperationBlocker[] {
  if (!current.hasPostings) return [];
  return [{
    code: "HAS_POSTINGS_CODE_LOCKED",
    message: `${entityName} ${current.code} has postings and its code cannot be changed`,
  }];
}

export function GLAccountReassignment(
  current: OperationState & { glAccountId: number },
  proposedGlAccountId: number,
  entityName: string,
): OperationBlocker[] {
  if (proposedGlAccountId === current.glAccountId || !current.hasPostings) return [];
  return [{
    code: "HAS_POSTINGS_GL_ACCOUNT_LOCKED",
    message: `${entityName} ${current.code} has postings and its GL account cannot be changed`,
  }];
}

export function Deactivation(
  current: OperationState,
  entityName: string,
): OperationBlocker[] {
  if (!current.linkedBy?.length) return [];
  return [{
    code: "LINKED_RECORD_CANNOT_BE_DEACTIVATED",
    message: `${entityName} ${current.code} is linked to and cannot be deactivated`,
  }];
}

export function Deletion(
  current: OperationState,
  entityName: string,
  options: { blockWhenHasPostings?: boolean } = {},
): OperationBlocker[] {
  const blockers: OperationBlocker[] = [];
  if (options.blockWhenHasPostings && current.hasPostings) {
    blockers.push({
      code: "HAS_POSTINGS_CANNOT_BE_DELETED",
      message: `${entityName} ${current.code} has postings and cannot be deleted`,
    });
  }
  if (current.linkedBy?.length) {
    blockers.push({
      code: "LINKED_RECORD_CANNOT_BE_DELETED",
      message: `${entityName} ${current.code} is linked to and cannot be deleted`,
    });
  }
  return blockers;
}
