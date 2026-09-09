# Semantic Capability Contract

Existing Voyzu capability contracts, using their current runtime names. Each row
describes one method. Package means the implementing package, not necessarily the
owner of the definition. `?` marks an optional parameter; `Id` is a positive integer.
Outputs are the resolved asynchronous results.

| Contract name | Method | Defining package | Package | Input parameters | Output parameters |
| --- | --- | --- | --- | --- | --- |
| `platform.identity` | `current` | Voyzu platform | `@voyzu/auth` | `{}` | `{ user: IdentityUser or null, actorType: "APP" / "API" / "SYSTEM", permissions: string[] }` |
| `platform.identity` | `lookup` | Voyzu platform | `@voyzu/auth` | `{ ids: Id[] }` | `{ users: { id: Id, code: string, displayName: string }[] }` |
| `platform.organization-directory` | `list` | Voyzu platform | `@voyzu/erp-core` | `{}` | `{ organizations: { id: Id, code: string, name: string }[] }` |
| `platform.transactional-email` | `send` | Voyzu platform | No implementation registered | `{ to: string[], subject: string, html?: string, text?: string, from?: string, replyTo?: string }` | `{ messageId?: string }` |
| `erp.organization-context` | `requested` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{}` | `{ organizationId: Id or null }` |
| `erp.organization-context` | `selectable` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{}` | `{ organizations: Organization[] }` |
| `erp.organization-context` | `current` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{}` | `{ selectedOrganization: Organization or null }` |
| `erp.organization-context` | `select` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{ organizationId: Id }` | `{ selectedOrganizationId: Id }` |
| `erp.organization-finance` | `createFinancialEntity` | `@voyzu/erp-core` | `@voyzu/finance` | `{ organizationId: Id }` | `{ financialEntityId: Id }` |
| `erp.inventory-catalog` | `listItems` | `@voyzu/erp-core` | `@voyzu/inventory` | `{ organizationId: Id }` | `{ items: { id: Id, sku: string, name: string, category: string or null, unit: string or null, quantityTracked: boolean, status: "ACTIVE" / "INACTIVE" }[] }` |
| `erp.inventory-catalog` | `getOperationalItems` | `@voyzu/erp-core` | `@voyzu/inventory` | `{ organizationId: Id, skus: string[] }` | `{ items: { id: Id, sku: string, name: string, description: string, quantityTracked: boolean, status: "ACTIVE" / "INACTIVE" }[] }` |
| `erp.inventory-activity` | `getStockActivityDetail` | `@voyzu/erp-core` | `@voyzu/inventory` | `{ organizationId: Id, code: string }` | `{ record: StockActivityDetail or null }` |
| `erp.inventory-finance` | `processInventoryMovement` | `@voyzu/erp-core` | `@voyzu/finance` | `{ organizationId: Id, movement: InventoryMovement }` | `{ financeInventoryActivityId: Id, processingStatus: "RECEIVED" / "PROCESSED" }` |

## Nested parameters

- **IdentityUser:** `id`, `code`, `displayName`, `role` (`ADMIN` / `STANDARD`), `status` (`ACTIVE` / `INACTIVE`) and `accessMode` (`UI` / `API` / `UI_AND_API`).
- **Organization:** `id`, `code`, `name`, `countryCode`, optional `country: { code, name }`, `baseCurrencyCode`, optional `baseCurrency: { code, name }`, `status` and `audit` metadata.
- **InventoryMovement:** `inventoryFinancialActivityId: Id`, `inventoryTransactionLineId: Id`, `inventoryDocumentCode: string`, `inventoryDocumentType` (`RECEIPT` / `ISSUE` / `ADJUSTMENT`), `itemId: Id`, `itemCode: string`, `itemName: string`, `quantityChange: number`, `reasonCode: string` and `activityDate: string` (date-time). Document and item codes follow the business-code pattern; item name and reason must be nonblank.
- **StockActivityDetail:** `id: Id`, `code: string`, `date: string`, `type: string`, `reference: string or null`, `notes: string`, `audit` metadata, plus:
  - `linkedDocuments`: records containing `documentType: string`, `documentId: Id`, `documentCode: string`, `creationDate: string` and `href: string or null`.
  - `lines`: records containing `id: Id`, `itemId: Id`, `sku: string`, `itemName: string`, `warehouseId: Id`, `warehouse: string`, `quantityChange: number` and `reasonCode: string or null`.

The platform defines the three `platform.*` contracts; ERP Core defines the five
`erp.*` contracts. `createFinancialEntity` and `processInventoryMovement` are
transactional methods. `RECEIVED` includes inventory movements waiting for a
matched financial document.
