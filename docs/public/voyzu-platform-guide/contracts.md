# Semantic contracts

Contracts replace the package command system. Within a package, use ordinary service imports. Across packages, callers use platform-resolved semantic contracts, not provider imports or package-specific command names.

Packages optionally declare `contracts.defines` and `contracts.implements` in `voyzu.package.ts`. Contract definitions live in top-level `contracts/capability/` and `contracts/master-data/`. Only the manifest registers them; there are no contract-specific `package.json` entry points or filename-based provider discovery.

## Capabilities

A capability is a named group of related methods. Each method declares TypeBox `input` and `output` object schemas, with `transactional: true` when the method requires a database transaction. Providers declare a lazy `load` function returning the method implementations. Their business inputs and results are JSON objects; identifiers retain the underlying data model's types.

```ts
import { capabilities } from "@voyzu/capability/contracts";

const { financialEntityId } = await capabilities
  .use("erp.organization-finance")
  .createFinancialEntity({ organizationId });
```

`use` errors when no provider is installed. `optional` returns undefined for a defined capability without an implementor; it does not swallow implementation errors. Both input and output are validated in every environment. Invalid output throws inside the transaction rather than merely logging a warning.

Composition rejects duplicate definitions, duplicate providers, implementations without definitions, invalid schemas, and invalid extension roots. Version 1 permits one provider per contract. Providers load lazily; an absent method is reported when invoked.

## Transactions

`capabilities.transaction(async (db) => { ... })` uses the platform's existing `withTransaction`. Transactional methods start a transaction or join the caller's transaction. `getDb()` returns the same executor across package boundaries through shared AsyncLocalStorage. Executors are never passed in JSON inputs. Nested operations do not commit independently; provider failures and output validation failures propagate to the outer transaction.

Services must not swallow transaction failures. Contracts are server-side integration, not an authorization boundary: callers and providers retain their existing access checks.

## Read-only master data

A root declares `id`, `data` and optionally `key` (the root value name in composed results, default `data`). An extension additionally declares `extends: { root, key }`. Root and extension IDs are independently validated; extensions currently receive the root lookup identifier. Providers declare an async `get(id)` returning the complete data object or null for a missing record.

```ts
const finance = await masterData.get("erp.organization.finance", organizationId);
const organization = await masterData.compose("erp.organization", organizationId);
// { organization: <complete Organization DTO>, extensions: { finance?: <complete Finance DTO> } }

// Explicitly require an extension provider:
await masterData.compose("erp.organization", organizationId, ["erp.organization.finance"]);
```

`get` always errors for an absent implementor. `compose` includes implemented extensions by default. Explicitly named extensions without an implementor error, even if the root record is missing. Missing root records return null; missing extension records are omitted. Provider failures propagate. Master data has no write API in v1.

## Composition and scripts

Development composition writes `.run/contracts/index.ts`, containing registration plus generated TypeScript map augmentation. Web instrumentation imports a generated bridge; the package script runner imports the same registry. Platform-only composition uses `.generated/contracts/` to avoid overwriting platform-owned definitions.

Run `npm run voyzu:compose -- --no-install` after changing contract definitions or providers. Chokidar copies package files but does not replace contract registration generation. Generated files are not source contracts.

The initial organization and finance schemas preserve every existing DTO field and numeric ID. The financial-entity storage model, service names and existing APIs remain unchanged.

Legacy command tests are retained as `.ts.disabled`, not rewritten. The new organization/Finance test lives under ERP Core `tests/contracts/` and can be run from the package-development repository with `npm run test:contracts`. It uses a real initialized database and rolls back its writes.
