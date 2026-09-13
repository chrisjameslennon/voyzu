import { CodeChange, CodeChangeAvailability as SharedCodeChangeAvailability, type OperationBlocker } from "@voyzu/organization/common/domain/operation-policy";

export interface OrganizationOperationState {
  code: string;
  hasPostings: boolean;
}

export function ChangeCode(current: OrganizationOperationState, proposedCode: string): OperationBlocker[] {
  return CodeChange(current, proposedCode, "Organization");
}

export function ChangeCodeAvailability(current: OrganizationOperationState): OperationBlocker[] {
  return SharedCodeChangeAvailability(current, "Organization");
}
