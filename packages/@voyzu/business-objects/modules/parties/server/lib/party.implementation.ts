import type { Party, PartyMethods } from "../../../../contracts/party.definition";
import initialParties from "../../mock-data/parties.json" with { type: "json" };

// Updates affect memory only; the JSON fixtures remain unchanged.
let parties: Party[] = structuredClone(initialParties);

export function resetPartyData(): void {
  parties = structuredClone(initialParties);
}

export async function get({ party_id }: { party_id: number }): Promise<Party | null> {
  const party = parties.find(party => party.party_id === party_id);
  return party ? { ...party } : null;
}

export async function findByCode({ code }: { code: string }): Promise<Party | null> {
  const party = parties.find(party => party.code === code);
  return party ? { ...party } : null;
}

export async function update({ party_id, changes }: Parameters<PartyMethods["update"]>[0]): Promise<void> {
  const party = parties.find(party => party.party_id === party_id);
  if (!party) throw new Error("Party not found");
  if (changes.code !== undefined) party.code = changes.code;
  if (changes.name !== undefined) party.name = changes.name;
}

export const partyMethods = { get, findByCode, update } satisfies PartyMethods;
