import { Deactivation, Deletion, type LinkedReference, type OperationBlocker } from "@voyzu/party/common/domain/operation-policy";

export interface PartyOperationState {
  code: string;
  linkedBy?: LinkedReference[];
}

export function Deactivate(current: PartyOperationState): OperationBlocker[] {
  return Deactivation({ ...current, linkedBy: current.linkedBy ?? [] }, "Party");
}

export function Delete(current: PartyOperationState): OperationBlocker[] {
  return Deletion({ ...current, linkedBy: current.linkedBy ?? [] }, "Party");
}
