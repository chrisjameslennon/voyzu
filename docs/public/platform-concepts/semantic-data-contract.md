# Semantic data contract

The semantic data contracts used by Voyzu, their implementing packages and the data
they describe. This table covers master data and its named compositions, not
capabilities. The composed result uses the full contract-name keys proposed in the
[meta specification](semantic-data-contract-meta.md).

| Entity Name | Contract name | Implemented by package | Data definition |
| --- | --- | --- | --- |
| Country | `platform.country` | `@voyzu/localization` | Country ID, code, name, currency code and currency summary, status and audit metadata. Lookup by country code. |
| Country | `erp.country.finance` | `@voyzu/finance` | Country and currency identification, status, financial-period start month, tax filing anchor month and interval, tax authorities, tax rules and tax components including rates. Extends `platform.country`; lookup by country code. |
| Country | `erp.country` | Composed from `@voyzu/localization` and `@voyzu/finance` | ERP Core's named composition of `platform.country` and `erp.country.finance`. Proposed result: `{ "platform.country": { ... }, "erp.country.finance": { ... } }`; lookup by country code. |
| Currency | `platform.currency` | `@voyzu/localization` | Currency ID, code, name, optional symbol, status and audit metadata. Lookup by currency code. |
| Organization | `erp.organization` | `@voyzu/erp-core` | Numeric ID, code, name, country code, base currency code, optional country/currency summaries, status and audit metadata. Lookup by organization ID. |
| Organization | `erp.organization.finance` | `@voyzu/finance` | All organization fields plus nullable Finance company ID, Finance-enabled flag, tax filing anchor month and interval, optional report headings/footer, and whether postings exist. Extends `erp.organization`; lookup by organization ID. |
| User | `platform.user` | `@voyzu/auth` | Numeric ID, code, nullable email, display name, role, access mode, implementer access, status and audit metadata. No credentials. Lookup by user code. |
