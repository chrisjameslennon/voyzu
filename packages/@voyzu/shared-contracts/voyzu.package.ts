
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import type { InternalApiInvoker } from "@voyzu/types/internal-api";
import type { Party } from "@voyzu/types/business-objects/party";
import type { CustomerAccount } from "./contracts/customer-account.definition";
import { CustomerDefinition } from "./contracts/customer.definition";
import { CustomerAccountDefinition } from "./contracts/customer-account.definition";
import { OrganizationDefinition } from "./contracts/organization.definition";
import { OrganizationAccessDefinition } from "./contracts/organization-access.definition";
import { OrganizationContextDefinition } from "./contracts/organization-context.definition";
import { DocumentLinkDefinition } from "./contracts/document-links.definition";
import { OrganizationFinanceDefinition } from "./contracts/organization-finance.definition";
import { CountryFinanceDefinition } from "./contracts/country-finance.definition";
import { InventoryItemDefinition } from "./contracts/inventory-item.definition";
import { InventoryItemOperationalDefinition } from "./contracts/inventory-item-operational.definition";
import { StockActivityDefinition } from "./contracts/stock-activity.definition";
import { InventoryFinanceDefinition } from "./contracts/inventory-finance.definition";
import { OrganizationWithFinanceDefinition } from "./contracts/organization-with-finance.definition";
import { CountryWithFinanceDefinition } from "./contracts/country-with-finance.definition";

export const sharedContractsPackage = {
  contracts: {
    httpApiRouting: {
      roots: [],
      routes: {  },
    },
    httpApiDocumentation: {
      "sections": {}
    },
    internalApi: {
      defines: {
        "@erp/customer": CustomerDefinition,
        "@erp/CustomerAccount": CustomerAccountDefinition,
        "@core/organization": OrganizationDefinition,
        "@core/organization-access": OrganizationAccessDefinition,
        "@core/organization-context": OrganizationContextDefinition,
        "@core/document-links": DocumentLinkDefinition,
        "@erp/organization-finance": OrganizationFinanceDefinition,
        "@erp/country-finance": CountryFinanceDefinition,
        "@erp/inventory-item": InventoryItemDefinition,
        "@erp/inventory-item-operational": InventoryItemOperationalDefinition,
        "@erp/stock-activity": StockActivityDefinition,
        "@erp/inventory-finance": InventoryFinanceDefinition,
        "@erp/organization-with-finance": OrganizationWithFinanceDefinition,
        "@erp/country-with-finance": CountryWithFinanceDefinition,
      },
      composes: {
        "@erp/country-with-finance": (api: InternalApiInvoker) => import("./composition/finance.implementation").then(m => ({ methods: m.createCountryWithFinanceMethods(api) })),
        "@erp/organization-with-finance": (api: InternalApiInvoker) => import("./composition/finance.implementation").then(m => ({ methods: m.createOrganizationWithFinanceMethods(api) })),
        "@erp/customer": (api: InternalApiInvoker) => import("./composition/customer.implementation")
          .then(module => ({ methods: module.createCustomerMethods({
            get: input => api.call("@core/party", "get", input) as Promise<Party | null>,
            update: input => api.call("@core/party", "update", input) as Promise<void>,
          }, {
            get: input => api.call("@erp/CustomerAccount", "get", input) as Promise<CustomerAccount | null>,
          }) })),
      },
    },
  },
  modules: [],
} as const satisfies VoyzuPackageDefinition;

export default sharedContractsPackage;
