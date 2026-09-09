# Semantic data contract

The proposed semantic names for Voyzu's data contracts, their implementing packages
and the data they describe. These names do not rename the current runtime contracts.
This table covers master data and its named compositions, not
capabilities. Results are unwrapped by default; `includeContractNames: true` wraps
each contribution in its full contract name, as proposed in the
[meta specification](semantic-data-contract-meta.md).

| Entity Name | Contract name | Implemented by package | Data definition |
| --- | --- | --- | --- |
| Country | `country` | `@voyzu/localization` | Country ID, code, name, currency code and currency summary, status and audit metadata. Lookup by country code. |
| Country | `country.finance` | `@voyzu/finance` | Financial-period start month, tax filing anchor month and interval, tax authorities, tax rules and tax components including rates. Supplies only the Finance contribution; extends `country`; lookup by country code. |
| Country | `country.withFinance` | Composed from `@voyzu/localization` and `@voyzu/finance` | ERP Core's named composition of `country` and `country.finance`, merged into one unwrapped object by default. With `includeContractNames: true`: `{ "country": { ... }, "country.finance": { ... } }`; lookup by country code. |
| Currency | `currency` | `@voyzu/localization` | Currency ID, code, name, optional symbol, status and audit metadata. Lookup by currency code. |
| Organization | `organization` | `@voyzu/erp-core` | Numeric ID, code, name, country code, base currency code, optional country/currency summaries, status and audit metadata. Lookup by organization ID. |
| Organization | `organization.finance` | `@voyzu/finance` | Nullable Finance company ID, Finance-enabled flag, tax filing anchor month and interval, optional report headings/footer, and whether postings exist. Supplies only the Finance contribution; extends `organization`; lookup by organization ID. |
| Organization | `organization.withFinance` | Composed from `@voyzu/erp-core` and `@voyzu/finance` | Proposed named composition of `organization` and `organization.finance`, merged into one unwrapped object by default. With `includeContractNames: true`: `{ "organization": { ... }, "organization.finance": { ... } }`; lookup by organization ID. Replaces the combined response currently supplied by Finance when providers return only their own defined data. |
| User | `user` | `@voyzu/auth` | Numeric ID, code, nullable email, display name, role, access mode, implementer access, status and audit metadata. No credentials. Lookup by user code. |
