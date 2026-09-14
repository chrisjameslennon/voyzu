# Package decoupling inventory

Date: 2026-09-14

Internal API follow-up: platform objects now expose `get` as their only read method. Header and line records share a contract; `@core/audit.get` includes `audit_change` lines in `changes`. Consumers of removed list/directory methods now read platform tables directly. Existing authorization and organization-selection rules remain in place.

| Platform contract | Read method | Write methods |
| --- | --- | --- |
| `@core/user` | `get` by code | None |
| `@core/auth` | `get` current identity and permissions | None |
| `@core/organization` | `get` by ID or code | `create`, `update`, `activate`, `deactivate`, `delete` |
| `@core/organization-access` | `get` | `replace` |
| `@core/organization-context` | `get` saved ID, available organizations and resolved selection | `setActiveOrganization` |
| `@core/country` | `get` by code | None |
| `@core/currency` | `get` by code | None |
| `@core/audit` | `get` event with change lines | None |
| `@core/document-links` | `get` by organization ID and link ID | `create`, `delete` |
| `@core/settings` | `get` by code | `set` |
| `@core/installed-package` | `get` by ID | None |
| `@core/party` | `get` by ID or code | `update` |

Composed `@erp` contracts retain their read methods; their Organization and Party code lookups use the corresponding `@core` `get` method.

Platform-read rule update: direct reads, joins and transactional row locking against pre-installed packages' tables are now permitted. The API-to-SQL reference-data helpers, Organization activation-lock API, and post-install initialization hook introduced during decoupling have been backed out. Original seed SQL and direct reads are restored. Seeding retains a separate exception only for writes to platform tables, such as Organization's homepage seed. Foundation's settings write API remains, because ordinary runtime writes are still restricted. Outstanding write findings from this snapshot are Inventory's document-link insert/delete and Finance's Audit/Organization cleanup deletes. The dynamic cascade installer has already been removed.

Foreign-key rule update: package-owned tables may reference platform tables owned by pre-installed packages, including their referential actions. All 28 foreign keys in this inventory are therefore permitted. The remaining confirmed cross-package data-access findings are 82 SQL references across Audit, Organization, Package Management, Finance and Inventory. The audit trigger remains exempt. Legacy migration compatibility is outside scope because this is a greenfield application.

Shared DTO follow-up: Country and Party DTO definitions now live in `@voyzu/types/dtos/country` and `@voyzu/types/dtos/party`. Localization, Business Objects and Shared Contracts consume these platform-owned definitions. The Country response schema and its shared constraints were moved as well, preserving the existing validation. Both production schema-import violations below are resolved. Combined with the switcher change, no production direct-import violations from this inventory remain; the three integration-test imports are left unchanged at the user's direction. Database findings remain outstanding.

Follow-up: the three OrganizationSwitcher imports listed in this snapshot have been resolved. The component and its props now live in the platform library `@voyzu/ui-business-components`; Commercial, Finance and Inventory import that library. The old Organization component export and those consumers' Organization peer dependencies have been removed. Five direct cross-package import references remain from this inventory: two production schema imports and three integration-test imports. The original inventory and counts below are retained as the audit snapshot.

## Scope and interpretation

Reviewed all 18 packages with a root voyzu.package.ts in voyzu/packages/@voyzu (12 pre-installed packages) and voyzu-packages/packages/@voyzu (6 extension packages). Source scan covered 1,648 TypeScript, JavaScript and SQL files, including active tests, install/seed/uninstall SQL, stored functions and sample-data scripts. Generated runtimes, node_modules, disabled legacy tests, unrelated example repositories and historical audit documents are not current package sources.

The rules are [Package contract: Decoupled](public/platform-contracts/package-contract.md#L11) and [Internal API contract](public/platform-contracts/internal-api.md#L1). Imports between packages are violations even for types, schemas, public package exports or test setup. Platform libraries such as @voyzu/capability, @voyzu/types and UI libraries are allowed. Internal API calls through the platform are allowed; wrapping a direct SQL query inside an internal API handler does not remove the underlying ownership violation.

Table ownership is taken from CREATE TABLE in each package's install folder. “Platform-owned” application tables therefore belong to their pre-installed package: audit_event/audit_change to Audit, organization/document_link to Organization, country/currency to Localization, app_user to Auth, and voyzu_settings to Foundation.

The database audit trigger and its attachment SQL are excluded, as requested. Ordinary Audit table queries and deletes are not excluded. Cross-package foreign keys are recorded separately as schema coupling: they directly depend on and enforce integrity against another package's table, and cascading deletes cross the boundary. Only the audit trigger exception was supplied; no general database-level exception is assumed.

This is a static inventory, not a runtime trace or a compiler-conformance certification. Counts below refer to source references, not executed query counts. No application changes, database operations, tests, typechecks or git commits were performed.

## Findings across all packages

Seven packages have confirmed direct cross-package violations. There are **8 cross-package import references in 6 files** (5 production references and 3 test references), and **82 direct foreign-table SQL references plus 28 foreign-key references in 48 files**. Dynamic schema mutation, legacy tables, PostgreSQL catalog access and platform re-export observations are additional items below, outside these counts.

| Package | Location | Cross-package imports | Foreign-table SQL references | Foreign keys | Finding |
| --- | --- | ---: | ---: | ---: | --- |
| @voyzu/api-reference | Pre-installed | 0 | 0 | 0 | No direct violations found; documentation script consumes generated platform route registries. |
| @voyzu/audit | Pre-installed | 0 | 4 | 0 | Reads Auth app_user in audit history queries (4 joins). |
| @voyzu/auth | Pre-installed | 0 | 0 | 0 | No cross-package violations found; PostgreSQL catalog reads noted below. |
| @voyzu/business-objects | Pre-installed | 0 | 0 | 0 | No direct violations found. |
| @voyzu/foundation | Pre-installed | 0 | 0 | 0 | No cross-package violations found; PostgreSQL catalog reads noted below. |
| @voyzu/localization | Pre-installed | 0 | 0 | 0 | No cross-package violations found; PostgreSQL catalog reads noted below. |
| @voyzu/organization | Pre-installed | 3 | 9 | 3 | Localization reads; Foundation settings seed; 3 foreign keys; 3 test-only imports. |
| @voyzu/package-management | Pre-installed | 0 | 2 | 0 | Reads and upserts Foundation voyzu_settings. |
| @voyzu/shared-contracts | Pre-installed | 2 | 0 | 0 | Imports Localization and Business Objects DTO schemas directly. |
| @voyzu/system-info | Pre-installed | 0 | 0 | 0 | No other-package access found; reads PostgreSQL catalog tables (see literal ownership-rule issue below). |
| @voyzu/ui-reference | Pre-installed | 0 | 0 | 0 | No direct violations found. |
| @voyzu/welcome | Pre-installed | 0 | 0 | 0 | No direct violations found. |
| @voyzu/commercial | Extension | 1 | 0 | 0 | Imports OrganizationSwitcher from Organization. |
| @voyzu/finance | Extension | 1 | 61 | 11 | Organization/Localization reads; Audit and Organization deletes in scripts; switcher import; 11 foreign keys; additional dynamic/legacy SQL below. |
| @voyzu/ice-creams | Extension | 0 | 0 | 0 | No direct violations found; audit trigger excluded. |
| @voyzu/inventory | Extension | 1 | 6 | 14 | Organization switcher import; reads/inserts/deletes document_link; organization reads in scripts; 14 foreign keys; legacy uninstall SQL below. |
| @voyzu/template | Extension | 0 | 0 | 0 | No direct violations found; audit trigger excluded. |
| @voyzu/ugly-package | Extension | 0 | 0 | 0 | No direct violations found. |

## Direct imports: complete list

| Consumer | Provider | Source | Import | Context |
| --- | --- | --- | --- | --- |
| organization | shared-contracts | [organization-finance.integration.test.ts:11](../packages/@voyzu/organization/tests/contracts/organization-finance.integration.test.ts#L11) | `../../../shared-contracts/voyzu.package` | Integration-test bootstrap |
| organization | auth | [organization-finance.integration.test.ts:12](../packages/@voyzu/organization/tests/contracts/organization-finance.integration.test.ts#L12) | `../../../auth/voyzu.package` | Integration-test bootstrap |
| shared-contracts | localization | [country-with-finance.internal-api.dto.ts:2](../packages/@voyzu/shared-contracts/types/country-with-finance.internal-api.dto.ts#L2) | `../../localization/types/country.internal-api.dto` | Production |
| shared-contracts | business-objects | [customer.internal-api.dto.ts:2](../packages/@voyzu/shared-contracts/types/customer.internal-api.dto.ts#L2) | `../../business-objects/types/party.internal-api.dto` | Production |
| commercial | organization | [CommercialOrganizationSwitcher.tsx:4](../../voyzu-packages/packages/@voyzu/commercial/modules/shared/client/CommercialOrganizationSwitcher.tsx#L4) | `@voyzu/organization/exports/components` | Production |
| finance | organization | [FinanceCompanySwitcher.tsx:4](../../voyzu-packages/packages/@voyzu/finance/modules/organization-finance/client/FinanceCompanySwitcher.tsx#L4) | `@voyzu/organization/exports/components` | Production |
| inventory | organization | [InventoryOrganizationSwitcher.tsx:4](../../voyzu-packages/packages/@voyzu/inventory/modules/common/client/InventoryOrganizationSwitcher.tsx#L4) | `@voyzu/organization/exports/components` | Production |
| organization | finance | [organization-finance.integration.test.ts:19](../packages/@voyzu/organization/tests/contracts/organization-finance.integration.test.ts#L19) | `dynamic import of packages/@voyzu/finance/voyzu.package.ts` | Integration-test bootstrap |

The three switchers import Organization's exported React component. The export is still owned by another package; it is not a platform-library exception. Shared Contracts imports executable TypeBox schemas from two other packages to construct composed DTOs. The integration test imports Shared Contracts and Auth manifests statically and Finance's manifest through a computed filesystem URL. Its purpose is valid integration testing, but the test is currently inside Organization's package, and the contract does not exempt tests.

## Direct foreign-table reads and writes

The following is the complete list of files and source locations found for direct operations on tables with a known different owner. A repeated shared SQL fragment can affect many service methods despite appearing once here. Line numbers identify table references; DELETE FROM is a delete, and INSERT ... ON CONFLICT DO UPDATE is an upsert.

| Consumer | File | Foreign tables and all reference lines |
| --- | --- | --- |
| audit | [modules/audit/server/db/audit-event.repo.ts](../packages/@voyzu/audit/modules/audit/server/db/audit-event.repo.ts#L88) | `app_user` (auth): 88, 114, 185, 197 |
| organization | [install/db/seed/home-page.seed.sql](../packages/@voyzu/organization/install/db/seed/home-page.seed.sql#L1) | `voyzu_settings` (foundation): 1 |
| organization | [modules/organizations/server/db/organization.repo.ts](../packages/@voyzu/organization/modules/organizations/server/db/organization.repo.ts#L20) | `country` (localization): 20, 90, 182, 207, 211; `currency` (localization): 21, 91, 182 |
| package-management | [modules/package-management/server/db/installed-package.repo.ts](../packages/@voyzu/package-management/modules/package-management/server/db/installed-package.repo.ts#L92) | `voyzu_settings` (foundation): 92, 96 |
| finance | [install/db/seed/finance-organization.seed.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/seed/finance-organization.seed.sql#L14) | `organization` (organization): 14 |
| finance | [modules/ap-subledger-counterparties/server/db/ap-subledger-counterparty.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/ap-subledger-counterparties/server/db/ap-subledger-counterparty.repo.ts#L28) | `country` (localization): 28, 56 |
| finance | [modules/ar-subledger-counterparties/server/db/ar-subledger-counterparty.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/ar-subledger-counterparties/server/db/ar-subledger-counterparty.repo.ts#L28) | `country` (localization): 28, 56 |
| finance | [modules/bank-cash-accounts/server/db/bank-cash-account.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/bank-cash-accounts/server/db/bank-cash-account.repo.ts#L23) | `organization` (organization): 23 |
| finance | [modules/control-accounts/server/db/control-account.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/control-accounts/server/db/control-account.repo.ts#L37) | `organization` (organization): 37 |
| finance | [modules/country-tax-settings/server/db/country-tax-setting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/country-tax-settings/server/db/country-tax-setting.repo.ts#L11) | `country` (localization): 11; `currency` (localization): 12 |
| finance | [modules/dimensions/server/db/dimension-value.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/dimensions/server/db/dimension-value.repo.ts#L14) | `organization` (organization): 14 |
| finance | [modules/dimensions/server/db/dimension.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/dimensions/server/db/dimension.repo.ts#L25) | `organization` (organization): 25 |
| finance | [modules/financial-document-processing-engine/ap_bill/db/ap-bill-posting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/ap_bill/db/ap-bill-posting.repo.ts#L215) | `organization` (organization): 215; `country` (localization): 230, 238, 263 |
| finance | [modules/financial-document-processing-engine/ar_invoice/db/ar-invoice-posting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/ar_invoice/db/ar-invoice-posting.repo.ts#L203) | `organization` (organization): 203; `country` (localization): 221, 231, 256 |
| finance | [modules/financial-document-processing-engine/ar_invoice_cancellation/db/ar-invoice-cancellation-posting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/ar_invoice_cancellation/db/ar-invoice-cancellation-posting.repo.ts#L23) | `organization` (organization): 23 |
| finance | [modules/financial-document-processing-engine/ar_receipt/db/ar-receipt-posting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/ar_receipt/db/ar-receipt-posting.repo.ts#L25) | `organization` (organization): 25; `country` (localization): 27, 35 |
| finance | [modules/financial-document-processing-engine/core/ap_processing/db/ap-processing.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/core/ap_processing/db/ap-processing.repo.ts#L5) | `organization` (organization): 5 |
| finance | [modules/financial-document-processing-engine/core/ar_adjustments/db/ar-adjustment-posting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/core/ar_adjustments/db/ar-adjustment-posting.repo.ts#L143) | `organization` (organization): 143; `country` (localization): 161, 179 |
| finance | [modules/financial-document-processing-engine/core/tax_processing/db/tax-processing.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/core/tax_processing/db/tax-processing.repo.ts#L6) | `organization` (organization): 6 |
| finance | [modules/financial-document-processing-engine/inventory/db/inventory-processing.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/inventory/db/inventory-processing.repo.ts#L130) | `organization` (organization): 130 |
| finance | [modules/financial-document-processing-engine/ledger_journal/db/ledger-journal-posting.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/financial-document-processing-engine/ledger_journal/db/ledger-journal-posting.repo.ts#L120) | `organization` (organization): 120 |
| finance | [modules/gl-account-categories/server/db/gl-account-category.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/gl-account-categories/server/db/gl-account-category.repo.ts#L39) | `organization` (organization): 39 |
| finance | [modules/gl-accounts/server/db/gl-account.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/gl-accounts/server/db/gl-account.repo.ts#L34) | `organization` (organization): 34 |
| finance | [modules/inventory-control-accounts/server/db/inventory-control-account.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/inventory-control-accounts/server/db/inventory-control-account.repo.ts#L12) | `organization` (organization): 12 |
| finance | [modules/inventory-processing/server/db/inventory-processing.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/inventory-processing/server/db/inventory-processing.repo.ts#L204) | `organization` (organization): 204 |
| finance | [modules/organization-finance/server/db/finance-company.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/organization-finance/server/db/finance-company.repo.ts#L12) | `organization` (organization): 12, 37, 45; `country` (localization): 12; `currency` (localization): 12 |
| finance | [modules/organization-finance/server/db/settings-scope.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/organization-finance/server/db/settings-scope.repo.ts#L22) | `organization` (organization): 22, 41, 51, 64 |
| finance | [modules/organization-finance/server/initialization/initialize-financial-entity.sql](../../voyzu-packages/packages/@voyzu/finance/modules/organization-finance/server/initialization/initialize-financial-entity.sql#L24) | `organization` (organization): 24, 394 |
| finance | [modules/reports/server/db/company-report.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/reports/server/db/company-report.repo.ts#L24) | `organization` (organization): 24 |
| finance | [modules/reports/tax-activity-reconciliation/server/db/tax-activity-reconciliation.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/reports/tax-activity-reconciliation/server/db/tax-activity-reconciliation.repo.ts#L110) | `organization` (organization): 110 |
| finance | [modules/tax-control-accounts/server/db/tax-control-account.repo.ts](../../voyzu-packages/packages/@voyzu/finance/modules/tax-control-accounts/server/db/tax-control-account.repo.ts#L12) | `organization` (organization): 12 |
| finance | [scripts/db/sample-data.repo.ts](../../voyzu-packages/packages/@voyzu/finance/scripts/db/sample-data.repo.ts#L14) | `organization` (organization): 14, 54, 63, 117, 134, 150, 203, 210, 322; `country` (localization): 123; `audit_change` (audit): 228; `audit_event` (audit): 229, 266 |
| inventory | [modules/stock/server/db/stock.repo.ts](../../voyzu-packages/packages/@voyzu/inventory/modules/stock/server/db/stock.repo.ts#L176) | `document_link` (organization): 176, 185, 331 |
| inventory | [scripts/db/sample-data.repo.ts](../../voyzu-packages/packages/@voyzu/inventory/scripts/db/sample-data.repo.ts#L9) | `organization` (organization): 9, 35; `document_link` (organization): 43 |

Concrete effects:

- **Audit → Auth:** audit-event.repo.ts joins app_user for actor labels and filtering in count/list/export/get queries. This is application SQL, not the exempt audit trigger.
- **Organization → Localization:** organization.repo.ts joins country/currency when returning organization records, including create/update results, and directly lists active countries.
- **Organization → Foundation:** home-page.seed.sql inserts/upserts the homepage setting in voyzu_settings.
- **Package Management → Foundation:** installed-package.repo.ts reads and upserts settings in voyzu_settings.
- **Finance → Organization/Localization:** repositories combine finance-owned rows with organization, country and currency. This reaches posting, counterparties, settings, account configuration, finance-company initialization and reporting. finance-company.repo.ts:37 additionally locks the organization row with FOR UPDATE OF c.
- **Finance scripts → Organization/Localization/Audit:** sample-data.repo.ts reads organizations/countries, deletes audit_change at line 228 using audit_event at line 229, deletes audit_event at line 266, and deletes organization at line 322. The caller is scripts/sample-data/teardown/teardown-sample-companies.ts. These deletions are not audit-trigger activity.
- **Inventory → Organization:** stock.repo.ts reads document_link at lines 176/185 and inserts links at line 331. Its sample-data repository reads organization, checks for document_link at line 39, and deletes links at line 43.

Finance's reports named “audit” generally read Finance's own ledger tables. Their names and audit metadata fields are not evidence of Audit-table access; the confirmed direct Audit-table access in Finance is in the sample-data repository above.

## Cross-package foreign keys: complete list

All foreign keys below target platform tables and are allowed under the updated package contract. They are retained here as an inventory of permitted dependencies, not violations.

| Consumer | Definition | Foreign table and reference lines |
| --- | --- | --- |
| organization | [table.organization-user-access.create.sql](../packages/@voyzu/organization/install/db/objects/table.organization-user-access.create.sql#L22) | `app_user` (auth): 22 |
| organization | [table.organization.create.sql](../packages/@voyzu/organization/install/db/objects/table.organization.create.sql#L24) | `country` (localization): 24; `currency` (localization): 25 |
| finance | [table.ap_counterparty.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.ap_counterparty.create.sql#L26) | `country` (localization): 26 |
| finance | [table.ap_subledger_entry_header.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.ap_subledger_entry_header.create.sql#L40) | `currency` (localization): 40 |
| finance | [table.ar_counterparty.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.ar_counterparty.create.sql#L26) | `country` (localization): 26 |
| finance | [table.ar_subledger_entry_header.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.ar_subledger_entry_header.create.sql#L39) | `currency` (localization): 39 |
| finance | [table.finance_country.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.finance_country.create.sql#L2) | `country` (localization): 2 |
| finance | [table.finance_organization.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.finance_organization.create.sql#L3) | `organization` (organization): 3 |
| finance | [table.inventory_ledger_entry_header.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.inventory_ledger_entry_header.create.sql#L37) | `currency` (localization): 37 |
| finance | [table.journal_header.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.journal_header.create.sql#L61) | `currency` (localization): 61 |
| finance | [table.tax_authority.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.tax_authority.create.sql#L11) | `country` (localization): 11 |
| finance | [table.tax_ledger_entry_header.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.tax_ledger_entry_header.create.sql#L36) | `currency` (localization): 36 |
| finance | [table.tax_rule.create.sql](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/table.tax_rule.create.sql#L10) | `country` (localization): 10 |
| inventory | [inventory.sql](../../voyzu-packages/packages/@voyzu/inventory/install/db/sql/inventory.sql#L33) | `organization` (organization): 33, 70, 119, 151, 184, 220, 254, 285, 319, 354, 386, 413, 447, 491 |

Organization's user-access FK cascades from Auth app_user; Finance's finance_organization FK cascades from Organization; Inventory's 14 organization FKs also use ON DELETE CASCADE. These dependencies persist even after runtime queries are migrated.

## Dynamic schema mutation and unresolved legacy ownership

- [Finance cascade installer](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/finance-organization-cascades.attach.sql#L7): selects all foreign keys pointing to finance_organization, then alters the referencing tables at lines 31–40. It does not restrict those tables to Finance's install-owned tables. This is an ownership-boundary defect: if another installed package references finance_organization, Finance will rewrite that package's constraint. The currently reviewed definitions do not demonstrate such an external referencing table, so this is conditional rather than a counted existing foreign-table mutation. The script also explicitly depends on Organization's table through its finance_organization FK branch.
- [Finance legacy inventory migration](../../voyzu-packages/packages/@voyzu/finance/install/db/objects/inventory-operational-ownership.remove.sql#L9): reads inventory_item at line 14, drops it at line 29, and drops inventory_category at line 30. Neither table is defined by a current install folder. The file describes migration away from Finance's former operational inventory storage; these are not the current Inventory tables item/item_category. Under a literal current-install ownership rule these operations fall outside the allowed set; historical ownership needs confirming before classifying them as another current package's tables.
- [Finance legacy teardown](../../voyzu-packages/packages/@voyzu/finance/scripts/sample-data/teardown/teardown-sample-companies.ts#L42): passes tax_subledger_entry (line 42) and counterparty (line 52) to the dynamic delete helper in [sample-data.repo.ts](../../voyzu-packages/packages/@voyzu/finance/scripts/db/sample-data.repo.ts#L217). Neither table is defined by current install SQL. Same ownership ambiguity as the legacy migration.
- [Inventory uninstall](../../voyzu-packages/packages/@voyzu/inventory/uninstall/db/sql/drop-inventory.sql#L12): drops item_component, which current Inventory install SQL does not define. Legacy ownership is unproven from the current definitions.

## PostgreSQL catalog access under the literal table rule

These are not another package's business tables, so they are excluded from the cross-package totals. However, the wording “only ... tables it defines in its install folder” also excludes them unless a platform metadata mechanism or an explicit exception is provided:

- Auth: install/db/sql/app-user.sql reads pg_type (4, 15, 82), pg_enum (81), information_schema.columns (61, 66), and pg_constraint (100).
- Foundation: install/db/sql/platform-domains.sql reads pg_type (4, 16, 31, 43, 55, 65, 75).
- Localization: install/db/objects/localization-domains.sql reads pg_type (4, 13).
- Finance: install/db/objects/finance-domains.sql reads pg_type (3, 7, 10, 14, 17, 20); table.finance_inventory_activity.create.sql reads information_schema.columns (136) and pg_constraint (149); finance-organization-cascades.attach.sql reads pg_constraint (11). Sample-data SQL also uses table-existence introspection.
- System Info: [system-info.ts](../packages/@voyzu/system-info/modules/system-info/server/lib/system-info.ts#L283) reads pg_database (283, 284) and pg_stat_database (285) for database diagnostics.
- Inventory: scripts/db/sample-data.repo.ts:39 checks the existence of Organization's document_link through to_regclass; sequence reset helpers inspect sequences for Inventory's own tables.

## Platform re-exports: architectural observation, not direct-import violations

Allowed platform entry points currently re-export package-owned definitions. For example, [country.definition.ts](../lib/types/src/business-objects/country.definition.ts#L1) points to Localization, [party.definition.ts](../lib/types/src/business-objects/party.definition.ts#L1) points to Business Objects, and [modules/core/audit.ts](../lib/types/src/modules/core/audit.ts#L2) points to Audit DTOs. Other business-objects wrappers point to Auth and Shared Contracts.

Consumers importing these platform entry points are using the documented public platform interface, so they are not counted as illegal direct imports. But the platform interface still has an implementation dependency on package-owned schema files. Moving genuinely shared DTO/contract definitions into platform-owned library files would remove that underlying dependency and give Shared Contracts an allowed alternative to its two direct imports. Merely changing an import path to a wrapper would not relocate ownership.

## Remediation boundaries

1. Route foreign-table business reads and writes through the owning package's internal API; add missing DTO-based methods where current contracts do not cover the operation. Keep transaction ownership with implementations and use the platform accessor so nested calls share transactions.
2. Replace the three package-owned switcher imports with a managed platform UI mechanism. Internal API is server-side; it is not a transport for React components.
3. Move shared schemas into platform-owned types/contracts and move cross-package test assembly outside individual package source, or explicitly revise the test boundary in the package contract.
4. Retain the permitted foreign keys to platform tables. Constrain Finance's dynamic DDL to owned tables. Legacy migration compatibility is outside the greenfield scope.

The internal API contract is treated as implemented and binding throughout. This inventory does not propose returning to semantic-data/capability APIs from the historical audit.
