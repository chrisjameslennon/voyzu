import type { Customer, CustomerMethods } from "../../../../../../../business-objects/customer.definition";
import type { CustomerAccountMethods } from "../../../../../../../business-objects/customer-account.definition";
import { partyMethods } from "../../../parties/server/lib/party.implementation";

// The caller supplies the account provider; Platform never imports Commercial.
// Runtime discovery/registration is not implemented by this factory.
export function createCustomerMethods(accounts: Pick<CustomerAccountMethods, "get">): CustomerMethods {
  async function get({ id }: { id: number }): Promise<Customer | null> {
    const party = await partyMethods.get({ id });
    if (!party) return null;
    const account = await accounts.get({ id });
    return account ? { ...party, account } : null;
  }

  async function findByCode({ code }: { code: string }): Promise<Customer | null> {
    const party = await partyMethods.findByCode({ code });
    return party ? get({ id: party.id }) : null;
  }

  const update = partyMethods.update;
  return { get, findByCode, update } satisfies CustomerMethods;
}
