# TODO: Package Data Access Isolation

## Rule

A package must never directly read or write a database table owned by another package. Table ownership is determined by the package's install SQL. This includes upstream packages and platform packages.

The earlier policy permitted upstream database access. The following remaining accesses do not satisfy this stricter rule.

## Application Code

| Accessing package | Table owner | Tables accessed | Usage |
| --- | --- | --- | --- |
| Platform Audit | Platform Auth | `app_user` | Reads actor details and searches by user code. |
| Platform Package Management | Platform Foundation | `voyzu_settings` | Reads and writes the application start page. |
| ERP Core | Platform Localization | `country`, `currency` | Reads organization country/currency details and country choices. |
| Finance | ERP Core | `organization` | Reads organization scope, settings, posting information and reports; also used during financial-entity initialization. |
| Finance | Platform Localization | `country`, `currency` | Reads tax settings, counterparty countries and posting information. |
| Inventory | ERP Core | `document_link` | Reads and inserts stock transaction document links. |

Representative source locations, relative to each repository root:

- Platform: `packages/@voyzu/audit/modules/audit/server/db/audit-event.repo.ts`
- Platform: `packages/@voyzu/package-management/modules/package-management/server/db/installed-package.repo.ts`
- Voyzu Packages: `packages/@voyzu/erp-core/modules/organizations/server/db/organization.repo.ts`
- Voyzu Packages: `packages/@voyzu/finance/modules/organization-finance/server/db/finance-company.repo.ts`
- Voyzu Packages: `packages/@voyzu/finance/modules/country-tax-settings/server/db/country-tax-setting.repo.ts`
- Voyzu Packages: `packages/@voyzu/inventory/modules/stock/server/db/stock.repo.ts`

## Scripts and Installation

| Accessing package | Other package's tables | Access |
| --- | --- | --- |
| ERP Core seed | Foundation's `voyzu_settings` | Inserts start-page configuration. |
| Finance seed | ERP Core's `organization` | Reads organizations when initializing Finance. |
| Finance sample-data scripts | ERP Core's `organization` | Reads and deletes organizations. |
| Finance sample-data scripts | Localization's `country` | Reads country information. |
| Finance sample-data cleanup | Audit's `audit_event`, `audit_change` | Deletes audit records. |
| Inventory sample-data scripts | ERP Core's `organization`, `document_link` | Reads organizations and deletes document links. |

## Database-Level Sharing

Cross-package foreign keys and shared audit triggers also remain. Audit installs a trigger on Auth's `app_user` table. The shared audit function reads triggering records and sets audit metadata.

These are separate from direct repository queries. Decide how the isolation rule applies to indirect database access before changing these mechanisms.

## Work Remaining

- [ ] Replace direct cross-package application queries with owner-provided semantic contracts or relocate the work to the owning package.
- [ ] Remove cross-package table access from seed, sample-data and cleanup scripts.
- [ ] Review cross-package foreign keys, cascades and audit triggers against the isolation rule.
- [ ] Repeat the source audit after migration and separately verify the live database.

## Audit Scope

Source audit performed on 12 September 2026 across platform and application packages, including install SQL, scripts and sample data. No live database verification was performed.

No direct foreign-table queries were found in Commercial, Ice Creams, Template or Ugly Package; shared audit infrastructure is the qualification. Semantic contracts have removed some coupling, but not the remaining accesses listed above.
