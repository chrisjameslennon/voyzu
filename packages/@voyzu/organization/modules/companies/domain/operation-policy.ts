import { CodeChange, CodeChangeAvailability as SharedCodeChangeAvailability, type OperationBlocker } from "@voyzu/organization/common/domain/operation-policy";

export interface CompanyOperationState {
  code: string;
  hasPostings: boolean;
}

export function ChangeCode(current: CompanyOperationState, proposedCode: string): OperationBlocker[] {
  return CodeChange(current, proposedCode, "Company");
}

export function ChangeCodeAvailability(current: CompanyOperationState): OperationBlocker[] {
  return SharedCodeChangeAvailability(current, "Company");
}
