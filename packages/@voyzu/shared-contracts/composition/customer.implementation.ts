import type { Customer, CustomerMethods } from "../contracts/customer.definition";
import type { CustomerAccountMethods } from "../contracts/customer-account.definition";
import type { PartyMethods } from "@voyzu/types/business-objects/party";

// The caller supplies the account provider; Platform never imports Commercial.
// The package loader supplies an account dependency backed by the internal API.
export function createCustomerMethods(partyMethods: PartyMethods, accounts: Pick<CustomerAccountMethods, "get">) {
  async function get({ party_id }: { party_id: number }): Promise<Customer | null> {
    const party = await partyMethods.get({ party_id });
    if (!party) return null;
    const account = await accounts.get({ party_id });
    if (account && account.party_id !== party_id) throw new Error("Customer account party_id does not match Party");
    return account ? { ...party, account } : null;
  }

  async function findByCode({ code }: { code: string }): Promise<Customer | null> {
    const party = await partyMethods.get({ code });
    return party ? get({ party_id: party.party_id }) : null;
  }

  const update = partyMethods.update;
  return { get, findByCode, update } satisfies CustomerMethods;
}
