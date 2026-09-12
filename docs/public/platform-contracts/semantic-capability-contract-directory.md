# Semantic Capability Contract Directory

Voyzu's Semantic Capability Contracts and their methods.
Data retrieval contracts are described separately as Semantic Data Contracts. Each row
describes one method. `Id` is a positive integer.
Outputs are the resolved asynchronous results.

| Contract name | Method | Defining package | Implementing package | Input parameters | Output parameters |
| --- | --- | --- | --- | --- | --- |
| `platform.identity` | `getCurrentIdentity` | Voyzu platform | `@voyzu/auth` (platform) | `{}` | `{ user: IdentityUser or null, actorType: "APP" / "API" / "SYSTEM", permissions: string[] }` |
| `erp.organization-context` | `getSavedOrganizationId` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{}` | `{ organizationId: Id or null }` |
| `erp.organization-context` | `getAvailableOrganizations` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{}` | `{ organizations: Organization[] }` |
| `erp.organization-context` | `getActiveOrganization` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{}` | `{ selectedOrganization: Organization or null }` |
| `erp.organization-context` | `setActiveOrganization` | `@voyzu/erp-core` | `@voyzu/erp-core` | `{ organizationId: Id }` | `{ selectedOrganizationId: Id }` |
| `erp.organization-finance` | `createFinancialEntity` | `@voyzu/erp-core` | `@voyzu/finance` | `{ organizationId: Id }` | `{ financialEntityId: Id }` |
| `erp.inventory-finance` | `processInventoryMovement` | `@voyzu/erp-core` | `@voyzu/finance` | `{ organizationId: Id, movement: InventoryMovement }` | `{ financeInventoryActivityId: Id, processingStatus: "RECEIVED" / "PROCESSED" }` |

## Nested parameters

- **IdentityUser:** `id`, `code`, `displayName`, `role` (`ADMIN` / `STANDARD`), `status` (`ACTIVE` / `INACTIVE`) and `accessMode` (`UI` / `API` / `UI_AND_API`).
- **Organization:** `id`, `code`, `name`, `countryCode`, optional `country: { code, name }`, `baseCurrencyCode`, optional `baseCurrency: { code, name }`, `status` and `audit` metadata.
- **InventoryMovement:** `inventoryFinancialActivityId: Id`, `inventoryTransactionLineId: Id`, `inventoryDocumentCode: string`, `inventoryDocumentType` (`RECEIPT` / `ISSUE` / `ADJUSTMENT`), `itemId: Id`, `itemCode: string`, `itemName: string`, `quantityChange: number`, `reasonCode: string` and `activityDate: string` (date-time). Document and item codes follow the business-code pattern; item name and reason must be nonblank.

The platform defines the listed `platform.identity` contract; ERP Core defines the three listed
`erp.*` contracts. `createFinancialEntity` and `processInventoryMovement` are
transactional methods. `RECEIVED` includes inventory movements waiting for a
matched financial document.
