# Voyzu Semantic Data Contract

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
| Country | `country.withFinance` | `@voyzu/erp-core` | Composed from `@voyzu/localization` and `@voyzu/finance` | ERP Core's named composition of `country` and `country.finance`, merged into one unwrapped object by default. Lookup by country code. |
| Currency | `currency` | Voyzu platform | `@voyzu/localization` | Currency ID, code, name, optional symbol, status and audit metadata. Lookup by currency code. |
| Organization | `organization` | `@voyzu/erp-core` | `@voyzu/erp-core` | Numeric ID, code, name, country code, base currency code, optional country/currency summaries, status and audit metadata. Lookup by organization ID. |
| Organization | `organization.finance` | `@voyzu/erp-core` | `@voyzu/finance` | Nullable Finance company ID, Finance-enabled flag, tax filing anchor month and interval, optional report headings/footer, and whether postings exist. Supplies only the Finance contribution; extends `organization`; lookup by organization ID. |
| Organization | `organization.withFinance` | `@voyzu/erp-core` | Composed from `@voyzu/erp-core` and `@voyzu/finance` | Named composition of `organization` and `organization.finance`; lookup by organization ID. Providers return only their own defined data. |
| User | `user` | Voyzu platform | `@voyzu/auth` | Numeric ID, code, nullable email, display name, role, access mode, implementer access, status and audit metadata. No credentials. Lookup by user code. |
