# Voyzu Semantic Data Contract Directory

This table lists the semantic names for Voyzu's data contracts, their implementing packages
and the data they describe.
This table covers master data and its named compositions, not
capabilities. Results are unwrapped by default; `includeContractNames: true` wraps
each contribution in its full contract name, as specified in the
[implementation](semantic-data-contract-implementation.md).

| Entity Name | Contract name | Defined in package | Implemented by package | Data definition |
| --- | --- | --- | --- | --- |
| Country | `country` | Voyzu platform | `@voyzu/localization` | Country ID, code, name, currency code and currency summary, status and audit metadata. Lookup by country code. |
| Country | `country.finance` | `@voyzu/erp-core` | `@voyzu/finance` | Financial-period start month, tax filing anchor month and interval, tax authorities, tax rules and tax components including rates. Supplies only the Finance contribution; extends `country`; lookup by country code. |
| Country | `country.withFinance` | `@voyzu/erp-core` | `@voyzu/erp-core` (composition) | ERP Core's named composition of `country` and `country.finance`, merged into one unwrapped object by default. Lookup by country code. |
| Currency | `currency` | Voyzu platform | `@voyzu/localization` | Currency ID, code, name, optional symbol, status and audit metadata. Lookup by currency code. |
| Organization | `organization` | `@voyzu/erp-core` | `@voyzu/erp-core` | Numeric ID, code, name, country code, base currency code, optional country/currency summaries, status and audit metadata. Lookup by organization ID. |
| Organization | `organization.finance` | `@voyzu/erp-core` | `@voyzu/finance` | Nullable Finance company ID, Finance-enabled flag, tax filing anchor month and interval, optional report headings/footer, and whether postings exist. Supplies only the Finance contribution; extends `organization`; lookup by organization ID. |
| Organization | `organization.withFinance` | `@voyzu/erp-core` | `@voyzu/erp-core` (composition) | Named composition of `organization` and `organization.finance`; lookup by organization ID. Providers return only their own defined data. |
| User | `user` | Voyzu platform | `@voyzu/auth` | Numeric ID, code, nullable email, display name, role, access mode, implementer access, status and audit metadata. No credentials. Lookup by user code. |
| User summary | `userSummary` | Voyzu platform | `@voyzu/auth` | Numeric ID, code and display name. Get by ID; `byIds({ ids })` performs batch audit enrichment without exposing full user records. |
| Organization directory | `organizationDirectory` | Voyzu platform | `@voyzu/erp-core` | Numeric ID, code and name. Get by ID; `all({})` includes active and inactive records. Independent of ERP's full organization definition. |
| Inventory item | `inventoryItem` | `@voyzu/erp-core` | `@voyzu/inventory` | Numeric ID, SKU, name, category, unit, quantity-tracked flag and status. Get by ID; `byOrganization({ organizationId })`. |
| Inventory item | `inventoryItem.operational` | `@voyzu/erp-core` | `@voyzu/inventory` | Inherits the item identifier; supplies SKU, name, description, quantity-tracked flag and status. Get by ID; `bySkus({ organizationId, skus })`. |
| Stock activity | `stockActivity` | `@voyzu/erp-core` | `@voyzu/inventory` | Numeric ID, code, date, type, reference, notes, audit metadata, linked documents and movement lines. Get by ID; `byCode({ organizationId, code })` returns zero or one record. |

`user`, `country`, `currency` and `organization` also declare `all({})` queries.
The summary and directory are separate roots because their identifiers and ownership
boundaries differ from the full records. Query results always contain the entire
declared record, including its identifier.
