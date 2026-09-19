# Data contract catalogue

Reviewed 19 September 2026.

This catalogue covers the formal internal API definitions in the source `voyzu` and `voyzu-packages` repositories. The lists include resource-level data contracts and operation-only contracts, following the [Internal API contract](public/platform-contracts/internal-api-contract.md). Runtime copies, compatibility re-exports, tests and ordinary screen/HTTP request DTOs are not counted separately. Names link to the authoritative definition, whose imports identify its DTOs; Audit links to its package documentation; Organization Finance and Organization with Finance link to their detail sections below.

Relationships records three forms of relationship between data contracts: **extends** retains another contract?s fields and adds to them; **composes** embeds another contract?s data; **references** identifies another record without embedding its full contract. Each reference is **mandatory** or **optional**, based on whether its identifying field(s) must be supplied. **referencedBy** is the derived inverse of references, not a separately declared relationship. These are documentation concepts at this stage; they add no runtime behavior or schema enforcement. A reference does not imply a database foreign key or that the referenced record still exists. An em dash means no relationship is documented. Supporting DTOs and implementation commentary belong in Notes.

`db persisted` describes the current implementation: `true` means the resource is backed by database records (including projections and dependent records); `false` means it is an in-memory resource, an assembled context/composed response with no separate stored record, or an operation-only contract. A false value does not imply that its component data or operation results are never persisted.

## List of Data Contracts

### Persisted Data Contracts

| Name | Relationships | Description | Notes |
| --- | --- | --- | --- |
| [Audit](audit-package-doc.md#internal-api-contract)<br>`@core/audit` | References Organization via `organization_id` (optional); Installed Package via `packageCode` (mandatory); User via `actorId` when the actor is a user (optional); affected entity via `entityType` + `entityId` (mandatory, polymorphic). | Audit event identifying who changed an entity, when, and its old/new field values. | **db persisted: true**<br>Optional Organization via `organization_id`; package via `packageCode`; actor via actor type/ID/code; affected entity via type/ID/code. Embeds an array of field changes. |
| [Country](../packages/@voyzu/localization/contracts/country.definition.ts)<br>`@core/country` | References Currency via `currencyCode` (mandatory). | Country identity, name, currency and active/inactive status. | **db persisted: true**<br>Currency reference via `currencyCode`, with an embedded code/name summary rather than the full Currency contract. Includes audit metadata. |
| [Currency](../packages/@voyzu/localization/contracts/currency.definition.ts)<br>`@core/currency` | — | Currency identity, code, name, optional symbol and status. | **db persisted: true**<br>Includes audit metadata; no other business-object reference is declared. |
| [Document Link](../packages/@voyzu/shared-contracts/contracts/document-links.definition.ts)<br>`@core/document-links` | References Organization via `organization_id` (mandatory); upstream and downstream documents via their type/ID pairs (both mandatory, polymorphic). | Directed relationship between two business documents. | **db persisted: true**<br>Organization via `organization_id`; connects an upstream and downstream document, each identified by type, ID and code. |
| [Installed Package](../packages/@voyzu/package-management/contracts/installed-package.definition.ts)<br>`@core/installed-package` | — | Installed-package metadata, repository, visibility, navigation order, required/preinstalled flags and navigation capabilities. | **db persisted: true**<br>Identifies a package by `code`; lists its page and HTTP API root paths. No dependency relationships are included in this data shape. |
| [Organization](../packages/@voyzu/shared-contracts/contracts/organization.definition.ts)<br>`@core/organization` | References Country via `countryCode` (mandatory); Currency via `baseCurrencyCode` (mandatory). | Organization identity, name, localization and status. | **db persisted: true**<br>Country via `countryCode`; Currency via `baseCurrencyCode`; optional code/name summaries rather than their full contracts; audit metadata. Internal API ID is `organization_id`. |
| [Organization Access](../packages/@voyzu/shared-contracts/contracts/organization-access.definition.ts)<br>`@core/organization-access` | References User via `userId` (mandatory); Organization via each entry in `organization_ids` (mandatory per entry; the array may be empty). | Organizations a user is permitted to access. | **db persisted: true**<br>One User (`userId`) to an array of Organization IDs (`organization_ids`). |
| [Party](../packages/@voyzu/business-objects/contracts/party.definition.ts)<br>`@core/party` | — | Minimal shared business identity: `party_id`, `code` and `name`. | **db persisted: true**<br>Base schema extended by Customer and finance counterparties. |
| [Settings](../packages/@voyzu/foundation/contracts/settings.definition.ts)<br>`@core/settings` | — | A setting identified by a nonblank code with a string value. | **db persisted: true**<br>No additional notes. |
| [User](../packages/@voyzu/auth/contracts/user.definition.ts)<br>`@core/user` | — | User identity, email, display name, role, UI/API access mode, implementer access and status. | **db persisted: true**<br>Includes audit metadata; organization access is represented separately by Organization Access. |
| [AP Counterparty](../packages/@voyzu/shared-contracts/contracts/finance-counterparties.definition.ts)<br>`@erp/ap-counterparties` | Extends Party. References Organization via `organization_id` (mandatory); Country via `country_code` (optional). | Accounts-payable counterparty with status and tax region/province. | **db persisted: true**<br>Organization via `organization_id`; optional Country via `country_code`. Shares its definition with AR Counterparty. |
| [AR Counterparty](../packages/@voyzu/shared-contracts/contracts/finance-counterparties.definition.ts)<br>`@erp/ar-counterparties` | Extends Party. References Organization via `organization_id` (mandatory); Country via `country_code` (optional). | Accounts-receivable counterparty with status and tax region/province. | **db persisted: true**<br>Organization via `organization_id`; optional Country via `country_code`. Shares its definition with AP Counterparty. |
| [Country Finance](../packages/@voyzu/shared-contracts/contracts/country-finance.definition.ts)<br>`@erp/country-finance` | References Country via `code` (mandatory). | Country financial-period and tax-filing defaults, with tax configuration. | **db persisted: true**<br>Country via `code`; embeds tax authorities, tax rules and tax components. Components reference rule and authority codes, plus a scheme code. |
| [Finance Document](../packages/@voyzu/shared-contracts/contracts/finance-documents.definition.ts)<br>`@erp/finance-documents` | — | Generic envelope for retrieving a finance document and its detail data. | **db persisted: true**<br>Organization via `organization_id`; document addressed by `document_type` and `code`. `document` and `details` are open records, so nested relationships are not specified. |
| [Inventory Item](../packages/@voyzu/shared-contracts/contracts/inventory-item.definition.ts)<br>`@erp/inventory-item` | — | Item ID, SKU, name, category, unit, quantity-tracking flag and status. Availability exposes on-hand, reserved and available quantities per warehouse. | **db persisted: true**<br>Organization is supplied to list/availability methods. Category and unit are nullable strings, not embedded records. Availability results connect `itemId` to `warehouseId`. |
| [Inventory Item Operational](../packages/@voyzu/shared-contracts/contracts/inventory-item-operational.definition.ts)<br>`@erp/inventory-item-operational` | — | Operational projection of an inventory item, including description, quantity-tracking flag and status. | **db persisted: true**<br>Shares item identity by ID/SKU, but declares an independent schema rather than extending Inventory Item. Bulk lookup is Organization-scoped. |
| [Organization Finance](#organization-finance)<br>`@erp/organization-finance` | References Organization via `organization_id` (mandatory). | Organization tax-filing schedule, optional report text and whether postings exist; also supports financial-entity creation. | **db persisted: true**<br>Organization via `organization_id`; financial entity via `financeCompanyId`. |
| [Stock Activity](../packages/@voyzu/shared-contracts/contracts/stock-activity.definition.ts)<br>`@erp/stock-activity` | — | Stock movement document with date, type, reference, notes and quantity changes by item and warehouse. | **db persisted: true**<br>Embeds lines referencing Inventory Item (`itemId`, SKU) and Warehouse (`warehouseId`); embeds linked document references and audit metadata. Code lookup is Organization-scoped. |

### Not Persisted Data Operations

Includes in-memory resources, composed responses, execution contexts and operation-only contracts. Operation-only contracts have no resource-level `dataDefinition`; their methods may still read or write database records.

| Name | Relationships | Description | Notes |
| --- | --- | --- | --- |
| [Authentication](../packages/@voyzu/auth/contracts/auth.definition.ts)<br>`@core/auth` | — | Current execution identity and access context; supports requests without a signed-in user. | **db persisted: false**<br>Resolved execution context; the underlying User is database-backed. Contains a nullable current-user projection rather than the full User contract, plus actor type and permission strings. |
| [Organization Context](../packages/@voyzu/shared-contracts/contracts/organization-context.definition.ts)<br>`@core/organization-context` | Composes Organization in `organizations[]` and nullable `selectedOrganization`. | Available organizations and the active organization for the current context. | **db persisted: false**<br>Assembled selection context, not a persisted record of this shape; the underlying Organizations and access grants are database-backed. `organization_id` identifies the active selection. |
| [Country with Finance](../packages/@voyzu/shared-contracts/contracts/country-with-finance.definition.ts)<br>`@erp/country-with-finance` | Extends Country; composes Country Finance as `finance`. | Composed country and financial configuration returned as one object. | **db persisted: false**<br>Composed response, not separately persisted; Country and Country Finance are database-backed. Retains Country’s Currency reference. Composition does not automatically combine implementations. |
| [Customer](../packages/@voyzu/shared-contracts/contracts/customer.definition.ts)<br>`@erp/customer` | Extends Party; composes Customer Account as `account`. | Canonical composed customer contract. | **db persisted: false**<br>Composed response, not its own persisted record. Party is database-backed; Customer Account currently uses in-memory data. Party and Customer Account share `party_id`. Platform composes their separately supplied data. This differs from Commercial’s independent customer CRUD prototype. The definition also explicitly reuses Party’s `update` method. |
| [Customer Account](../packages/@voyzu/shared-contracts/contracts/customer-account.definition.ts)<br>`@erp/CustomerAccount` | References Party via `party_id` (mandatory). | Customer credit limit and purchase-order requirement. | **db persisted: false**<br>Current Commercial implementation reads and updates in-memory customer data. Party reference through `party_id`; this is not inheritance from Party. Composed into Customer. Resource identifier casing is preserved from the registration. |
| [Organization with Finance](#organization-with-finance)<br>`@erp/organization-with-finance` | Extends Organization; composes Organization Finance as `finance`. Inherits references to Country and Currency (mandatory); `finance` references Organization (mandatory). | Composed organization and financial configuration returned as one object. | **db persisted: false**<br>Composed response, not separately persisted; Organization and Organization Finance are database-backed. Retains Organization’s Country and Currency references. Composition does not automatically combine implementations. |
| [Customer Price List](../../voyzu-packages/packages/@voyzu/commercial/modules/customers/contracts/customer-price-list.definition.ts)<br>`@voyzu/commercial/customer-price-lists` | Composes Customer Price List Item in `items[]`. | Price-list ID and name with explicit priced items. | **db persisted: false**<br>Current implementation reads and updates in-memory customer data. No customer ID or organization ID is declared. This internal API is separate from the newer percentage/amount adjustment prototype. |
| [Customer Price List Item](../../voyzu-packages/packages/@voyzu/commercial/modules/customers/contracts/customer-price-list-item.definition.ts)<br>`@voyzu/commercial/customer-price-list-items` | — | Individually addressable item with ID, code, name and price. | **db persisted: false**<br>Current implementation reads and updates in-memory customer data. Contained by Customer Price List; no explicit product ID, customer ID or parent-list ID is declared. |
| [Inventory Finance](../packages/@voyzu/shared-contracts/contracts/inventory-finance.definition.ts)<br>`@erp/inventory-finance` | — | Processes an inventory movement and returns its finance activity ID and processing status. | **db persisted: false**<br>Operation-only contract; its processing can persist finance activity records. Organization; inventory financial activity and transaction line; inventory document and item; resulting finance inventory activity. |
| [Ledger Documents](../packages/@voyzu/shared-contracts/contracts/ledger-documents.definition.ts)<br>`@erp/ledger-documents` | — | Read operations with separate typed response DTOs rather than one resource-level data object. | **db persisted: false**<br>Operation-only contract; reads persisted ledger documents and derived reports. Organization-scoped retrieval of tax/inventory ledger entries, journals, AR/AP entries and documents, counterparty summaries/statements, invoices and bills. |
| [Ledger Posting](../packages/@voyzu/shared-contracts/contracts/ledger-posting.definition.ts)<br>`@erp/ledger-posting` | — | Posts or reverses AP/AR documents, payments/receipts and applications, inventory movements, journals and tax transactions. | **db persisted: false**<br>Operation-only contract; its operations persist accounting records. Organization plus the document-specific relationships declared by each posting request/response DTO. |

## Data Contracts

### Organization Finance

**Resource:** `@erp/organization-finance`  
**db persisted: true**

Financial settings for an organization, implemented by Ledger. It references Organization via `organization_id` (mandatory), without extending or composing it. Organization with Finance composes this contract beneath its `finance` property.

#### TypeScript interfaces and methods

Expanded from the [Organization Finance definition](../packages/@voyzu/shared-contracts/contracts/organization-finance.definition.ts) and [internal API DTO](../packages/@voyzu/shared-contracts/types/organization-finance.internal-api.dto.ts) for readability. The source derives these types from TypeBox schemas. Data and methods remain separate interfaces.

```ts
interface OrganizationFinance {
  organization_id: number;
  financeCompanyId: number;
  taxFilingAnchorMonth: number;
  taxFilingIntervalMonths: 1 | 2 | 3 | 6 | 12;
  reportLine1?: string;
  reportLine2?: string;
  reportFooter?: string;
  hasPostings: boolean;
}

interface OrganizationFinanceChanges {
  taxFilingAnchorMonth: number;
  taxFilingIntervalMonths: 1 | 2 | 3 | 6 | 12;
  reportLine1?: string;
  reportLine2?: string;
  reportFooter?: string;
}

interface OrganizationFinanceMethods {
  get(parameters: {
    organization_id: number;
  }): Promise<OrganizationFinance | null>;

  update(parameters: {
    organization_id: number;
    changes: OrganizationFinanceChanges;
  }): Promise<OrganizationFinance>;

  createFinancialEntity(parameters: {
    organization_id: number;
  }): Promise<{ financialEntityId: number }>;
}
```

IDs must be positive integers. The anchor month is 1?12; the interval is 1, 2, 3, 6 or 12 months. Each optional report string allows up to 80 characters.

- `get` returns `null` for a missing or deleted organization. In the current implementation, an existing organization without a financial entity raises an error.
- `update` requires both tax-filing fields; it is not a partial patch. Omitted or empty report strings clear those values. Only active organizations can be updated.
- `createFinancialEntity` creates the financial entity and initializes its standard financial settings, using the organization?s country finance configuration. If one already exists, it returns its ID and preserves its customized settings.
- No delete method is exposed.

#### Create SQL

The following is the current installation SQL. It uses Foundation domains from [platform-domains.sql](../packages/@voyzu/foundation/install/db/sql/platform-domains.sql).

[table.finance_organization.create.sql](../../voyzu-packages/packages/@voyzu/ledger/install/db/objects/table.finance_organization.create.sql)

```sql
CREATE TABLE IF NOT EXISTS finance_organization (
    id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    organization_id BIGINT NOT NULL UNIQUE REFERENCES organization(id) ON DELETE CASCADE,
    report_line_1 description_text,
    report_line_2 description_text,
    report_footer description_text,
    tax_filing_anchor_month INTEGER NOT NULL DEFAULT 3 CHECK (tax_filing_anchor_month BETWEEN 1 AND 12),
    tax_filing_interval_months INTEGER NOT NULL DEFAULT 3 CHECK (tax_filing_interval_months IN (1, 2, 3, 6, 12)),

    creation_date audit_timestamp,
    creation_actor_type actor_type,
    creation_user_id TEXT,
    creation_mutation_id UUID,
    updated_date audit_timestamp,
    updated_actor_type actor_type,
    updated_user_id TEXT,
    updated_mutation_id UUID,
    deletion_date audit_timestamp,
    deletion_actor_type actor_type,
    deletion_user_id TEXT,
    deletion_mutation_id UUID
);
```

#### Storage and relationships

- **references:** Organization via `organization_id` (mandatory). The inverse is derived: Organization is **referencedBy** Organization Finance; an organization may have zero or one finance record.
- `finance_organization.organization_id` is a unique foreign key to `organization.id`, with `ON DELETE CASCADE`. An organization can have at most one financial entity.
- `organization_id` in the contract identifies the organization. `financeCompanyId` maps to `finance_organization.id`; the creation method returns that same ID as `financialEntityId`.
- `taxFilingAnchorMonth`, `taxFilingIntervalMonths` and the report strings map to their snake-case table columns. Null report values are omitted from the response.
- `hasPostings` is calculated using an existence query against `journal_header` for the financial entity. It is not stored in `finance_organization`.
- The table includes audit metadata, but this internal API contract does not expose it.

See the [implementation](../../voyzu-packages/packages/@voyzu/ledger/modules/organization-finance/server/lib/organization-finance.implementation.ts), [service](../../voyzu-packages/packages/@voyzu/ledger/modules/organization-finance/server/lib/finance-company.service.ts) and [repository](../../voyzu-packages/packages/@voyzu/ledger/modules/organization-finance/server/db/finance-company.repo.ts) for provisioning and database-to-contract mapping.

### Organization with Finance

**Resource:** `@erp/organization-with-finance`  
**db persisted: false**

Read-only composed organization and financial configuration, implemented by the platform shared-contracts package. Extends Organization and composes [Organization Finance](#organization-finance) as the required `finance` property.

#### TypeScript interfaces and methods

Expanded from the [Organization with Finance definition](../packages/@voyzu/shared-contracts/contracts/organization-with-finance.definition.ts) and [internal API DTO](../packages/@voyzu/shared-contracts/types/organization-with-finance.internal-api.dto.ts) for readability. The source combines TypeBox schema properties; the equivalent TypeScript below makes the inheritance and composition explicit. Data and methods remain separate interfaces.

```ts
import type { Organization } from "@voyzu/types/business-objects/organization";
import type { OrganizationFinance } from "@voyzu/types/business-objects/organization-finance";

interface OrganizationWithFinance extends Organization {
  finance: OrganizationFinance;
}

interface OrganizationWithFinanceMethods {
  get(parameters: {
    organization_id: number;
  }): Promise<OrganizationWithFinance | null>;

  findByCode(parameters: {
    code: string;
  }): Promise<OrganizationWithFinance | null>;
}
```

The inherited Organization fields are `organization_id`, `code`, `name`, `countryCode`, optional `country`, `baseCurrencyCode`, optional `baseCurrency`, `status` and `audit`. See the [Organization schema](../packages/@voyzu/shared-contracts/types/organization.internal-api.dto.ts). The nested `finance` property contains the full Organization Finance contract shown above.

- `get` requires a positive integer organization ID. It calls Organization `get` and Organization Finance `get` in parallel and combines their responses.
- `findByCode` first loads Organization by code, then retrieves Organization Finance using the returned organization ID.
- Both methods return `{ ...organization, finance }` when both records are returned, otherwise `null`. Errors from either underlying API propagate: an existing organization without a financial entity currently raises an error in the finance provider.
- The finance provider is required. These calls are not optional when Ledger is absent.
- Extending the data shape does not inherit Organization?s methods. No create, update, activate, deactivate or delete methods are exposed here.

#### Create SQL

None. This contract has no dedicated table or database view, so there is no `CREATE TABLE` statement for Organization with Finance. Its response is assembled in application code from Organization and Organization Finance.

The financial portion is persisted in `finance_organization`; its create SQL is in the [Organization Finance section](#organization-finance).

#### Storage and relationships

- Extends the Organization data contract, preserving all its fields at the top level.
- Composes Organization Finance under `finance`. This property is required, not nullable, on a successful response.
- The top-level `organization_id` and `finance.organization_id` identify the same organization. `finance.financeCompanyId` identifies the separate financial entity record.
- The underlying database relationship is `finance_organization.organization_id ? organization.id`, enforced by a unique foreign key. This composed response introduces no additional persisted relationship.
- No application callers currently invoke this internal API. The Organization detail page reads Organization and Organization Finance separately.

See the [composition implementation](../packages/@voyzu/shared-contracts/composition/finance.implementation.ts) for the calls and response assembly.
