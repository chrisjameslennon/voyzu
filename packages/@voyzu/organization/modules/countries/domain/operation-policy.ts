import { Deactivation, Deletion, type LinkedReference, type OperationBlocker } from "@voyzu/organization/common/domain/operation-policy";

export interface CountryOperationState {
  code: string;
  linkedBy?: LinkedReference[];
}

export function Deactivate(current: CountryOperationState): OperationBlocker[] {
  return Deactivation({ ...current, linkedBy: current.linkedBy ?? [] }, "Country");
}

export function Delete(current: CountryOperationState): OperationBlocker[] {
  return Deletion({ ...current, linkedBy: current.linkedBy ?? [] }, "Country");
}
