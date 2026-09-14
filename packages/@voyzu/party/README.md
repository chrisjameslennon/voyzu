# Party

Preinstalled management of the shared `party` table at **Settings → Parties**.
The numeric Party IDs and `@core/party` contract are the identities used by Finance counterparties and other consumers.

The package owns the table and the `@core/party` implementation. It provides code/name editing, active/inactive status, audit information and CRUD HTTP routes under `/parties`. Referenced parties cannot be deleted; database foreign keys enforce this without dependencies on consuming packages.
