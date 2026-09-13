import type { VoyzuPackageDefinition } from "../../../lib/types/src/framework";
import type { InternalApiInvoker } from "../../../lib/types/src/internal-api";
import { PartyDefinition } from "../../../business-objects/party.definition";
import { CustomerDefinition } from "../../../business-objects/customer.definition";
import { CustomerAccountDefinition, type CustomerAccount } from "../../../business-objects/customer-account.definition";

export const businessObjectsPackage = {
  contracts: {
    internalApi: {
      defines: {
        "@core/party": PartyDefinition,
        "@erp/customer": CustomerDefinition,
        "@erp/CustomerAccount": CustomerAccountDefinition,
      },
      implements: {
        "@core/party": () => import("./modules/parties/server/lib/party.implementation").then(module => module.partyMethods),
      },
      composes: {
        "@erp/customer": (api: InternalApiInvoker) => import("./modules/customers/server/lib/customer.implementation")
          .then(module => module.createCustomerMethods({
            get: input => api.call("@erp/CustomerAccount", "get", input) as Promise<CustomerAccount | null>,
          })),
      },
    },
  },
  modules: [],
} as const satisfies VoyzuPackageDefinition;

export default businessObjectsPackage;
