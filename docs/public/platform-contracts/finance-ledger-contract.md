# Finance and Ledger

Finance owns AR/AP operations: invoices, bills, sales and purchase items, statements, live counterparties and operational source documents. Ledger owns accounting, supporting ledgers, financial periods, accounting settings, integration processing and accounting reports.

The packages have no imports, foreign keys or direct table access between them. Platform defines their shared internal API schemas; the owning package supplies each implementation. Calls within either package use normal imports.

## Counterparties and Party

Platform persists Party in `party`. Its `@core/party` contract provides `get`, `create` and `update`. Party owns the shared code and name.

Finance's `ar_counterparty` and `ap_counterparty` tables reference Platform Party and Organization through `party_id` and `organization_id`. Each organization has at most one AR account and one AP account for a Party. A Party can participate in both. Finance owns account status, country and tax-region settings.

`@erp/ar-counterparties` and `@erp/ap-counterparties` expose `get`, `list` and `ensure`. `get` takes `organization_id` and `party_id` and returns the Party identity with the account fields, or `null`. `ensure` creates a missing Party and account within the provider's transaction; it does not overwrite an existing Party's identity.

Ledger retains its own posting-time counterparty snapshots in `ledger_ar_counterparty_snapshot` and `ledger_ap_counterparty_snapshot`. They support historical accounting and have no foreign keys into Finance. Ledger's live-counterparty drill-down uses the shared contracts.

## Documents and posting

`@erp/finance-documents` provides `get` and `record` for all Finance document types. The document identity is `(organization_id, document_type, code)`. The DTO contains the supplied document and its calculated details. Recording the same identity again preserves the first recorded document.

AR/AP calls through `@erp/ledger-posting` capture an operational source document through Finance's optional provider when it is installed. Ledger's own direct posting calls retain their local document ownership. Ledger also retains the supplied and calculated snapshots with its journal, so historical documents survive removal of Finance.

`@erp/ledger-documents` exposes typed retrieval of journals, AR/AP documents and entries, tax entries and inventory entries. It also supplies invoice and bill views, statement summaries and statements to Finance. These reads return the assembled document data; callers do not join Ledger tables.

`@erp/ledger-posting` exposes the accounting engine's AR, AP, inventory, journal and tax operations. Each request contains `organization_id` and `document`; Ledger authorizes that organization and supplies its company code to the posting engine. A conflicting company code in the document is rejected. Each method uses a request and response DTO and is declared transactional by Ledger's provider. Nested calls share the Platform database transaction, including Finance document capture and Party/account creation.

Cross-package document requests use Platform's `organization_id`. Ledger resolves its private accounting entity internally. Providers enforce access to the requested organization.

## Package availability

Check `internalApi.has` when the page needs to distinguish an unavailable package from a missing record. Use `callOptional` for optional retrieval: an absent provider returns `null`; validation and provider errors still propagate.

Finance shows an unavailable state for accounting views when Ledger is absent. Ledger disables live-counterparty drill-down when Finance or the account is unavailable, while retaining its posted document snapshots. A document lookup returning `null` from an available provider means the document was not found.

Installing either package does not require the other. Their install, uninstall and maintenance scripts operate on their own tables. Platform Party and Organization outlive removal of either extension.
