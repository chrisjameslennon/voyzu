import { Deactivation, Deletion, type LinkedReference, type OperationBlocker } from "@voyzu/organization/common/domain/operation-policy";

export interface CurrencyOperationState {
  code: string;
  linkedBy?: LinkedReference[];
}

export function Deactivate(current: CurrencyOperationState): OperationBlocker[] {
  return Deactivation({ ...current, linkedBy: current.linkedBy ?? [] }, "Currency");
}

export function Delete(current: CurrencyOperationState): OperationBlocker[] {
  return Deletion({ ...current, linkedBy: current.linkedBy ?? [] }, "Currency");
}
