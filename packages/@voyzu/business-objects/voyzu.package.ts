import type { VoyzuPackageDefinition } from "../../../lib/types/src/framework";
import type { InternalApiInvoker } from "../../../lib/types/src/internal-api";
import { PartyDefinition } from "../../../business-objects/party.definition";
import { CustomerDefinition } from "../../../business-objects/customer.definition";
import { CustomerAccountDefinition, type CustomerAccount } from "../../../business-objects/customer-account.definition";

export const businessObjectsPackage = {
  contracts: {
    defines: {
      "@core/party": PartyDefinition,
      "@core/customer": CustomerDefinition,
      "@core/customer/account": CustomerAccountDefinition,
    },
    implements: {
      "@core/party": () => import("./modules/parties/server/lib/party.implementation").then(module => module.partyMethods),
      "@core/customer": (api: InternalApiInvoker) => import("./modules/customers/server/lib/customer.implementation")
        .then(module => module.createCustomerMethods({
          get: input => api.call("@core/customer/account", "get", input) as Promise<CustomerAccount | null>,
        })),
    },
  },
  modules: [],
} as const satisfies VoyzuPackageDefinition;

export default businessObjectsPackage;
