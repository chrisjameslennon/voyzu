# Semantic contracts

Within a package, use ordinary service imports. Across packages, use platform-resolved
contracts rather than importing a provider or its schemas.

Packages register `contracts.semanticDataDefinition` and
`contracts.semanticCapabilityDefinition` in `voyzu.package.ts`. Each contains
`defines` and/or `implements`. Definitions live in the owner's top-level
`contracts/` folder; neither package exports nor filenames register providers.

See the [data implementation specification](../platform-contracts/semantic-data-contract-implementation.md)
and [capability implementation specification](../platform-contracts/semantic-capability-contract-implementation.md)
for the complete syntax.

## Capabilities

A capability declares a `functions` map. Each function may declare TypeBox `input`
and `output` schemas and `transactional: true`. An omitted input takes no arguments;
an omitted output returns no value. Object outputs are preferred.

Implementations register asynchronous functions directly. Use dynamic imports
inside those functions to keep business implementations lazy.

```ts
import { capabilities } from "@voyzu/capability/contracts";

const { financialEntityId } = await capabilities
  .use("erp.organization-finance")
  .createFinancialEntity({ organizationId });
```

`use` errors without an implementation. `optional` returns undefined when a defined
capability has no implementation. Neither swallows provider or validation errors.
Composition requires every registered implementor to supply all declared functions.

## Transactions

`capabilities.transaction(async (db) => { ... })` uses `withTransaction`.
Transactional functions start a transaction or join the caller's transaction.
`getDb()` returns the same executor across package boundaries through shared
AsyncLocalStorage; executors are not JSON inputs.

Output validation runs inside the transaction. Provider and validation failures
propagate and roll back the outer transaction. Transactions do not undo external
effects or span background jobs.

Contracts are internal server interfaces, not new public endpoints or an
authorization bypass. Callers and providers retain their existing access checks.

## Read-only Semantic Data Contracts

Only the root declares `identifier` and `identifierDataDefinition`.
`dataDefinition` describes the contribution without redeclaring that identifier.
An extension names its root using `extends`; a composition additionally lists
`extensions`. Each provider supplies its own data, not another provider's fields.

Providers implement `get(identifier)` and every declared query. Queries have an
`inputDataDefinition`; their output is always an array of full identified contract
records, with no extra fields. There is no generic list operation.

```ts
import { semanticData } from "@voyzu/capability/contracts";

const country = await semanticData.get("country", "NZ");
const combined = await semanticData.get("country.withFinance", "NZ");
const countries = await semanticData.query("country", "all", {});
const labels = await semanticData.queryOptional("organizationDirectory", "all", {});
```

| Call | Missing implementation | Missing record / no matches |
| --- | --- | --- |
| `get` | Error | `null` |
| `getOptional` | `null` | `null` |
| `query` | Error | `[]` |
| `queryOptional` | `null` | `[]` |

Undefined contracts or queries, invalid inputs/outputs and provider failures remain
errors for all calls. Optionality belongs to the consumer, not provider registration.

### Examples

```text
country — Platform defines; Localization implements
└── country.finance — ERP Core defines; Finance implements

country.withFinance — ERP Core defines and implements composition
├── country
└── country.finance
```

```text
organization — ERP Core defines and implements
└── organization.finance — ERP Core defines; Finance implements

organization.withFinance — ERP Core defines and implements composition
├── organization
└── organization.finance
```

Each composition registers a get handler calling
`semanticData.compose(compositionName, identifier)`. The helper retrieves the
declared contributors rather than calling that handler recursively. Results are
merged by default; `includeContractNames: true` wraps each contribution in its
full contract name, retaining the identifier.

All required implementations must exist for ordinary retrieval. Any missing
contributing record makes the whole composition null; partial compositions are
not returned. Optional retrieval also returns null for a missing implementation.
Duplicate fields and mismatched identifiers are errors.

The split preserves ownership: Localization and ERP Core remain usable without
Finance, and neither imports Finance or queries its tables. ERP Core owns the
shared composition vocabulary, not all underlying records.

#### Peer extensions, not nested extensions

Multiple direct-root extensions are supported. Extensions of extensions and
nested compositions are rejected. A package may define an extension that another
package implements; that does not require nesting.

## Identity, directories and Inventory

`user` retains code-based lookup and full user DTOs without credentials.
`userSummary` uses numeric IDs and a `byIds` batch query for audit labels.
`platform.identity.getCurrentIdentity({})` remains a capability returning the
request-scoped user, actor type and permissions.

Platform defines `organizationDirectory`; ERP Core implements `all({})` using its
own repository. Audit uses optional querying: without ERP, filters are empty and
recorded IDs remain usable. The directory includes inactive organizations, not
deleted records, and is separate from current-user organization selection.

ERP Core defines `inventoryItem`, `inventoryItem.operational` and `stockActivity`;
Inventory implements them. Organization-scoped and batch-SKU queries preserve
existing access boundaries and batching. Finance keeps its unavailable/empty
fallbacks, while unresolved posting-profile usage checks fail closed.
`semanticData.isImplemented(name)` permits registry-only availability checks
without fetching records or returning a provider.

## Composition and scripts

`voyzu:compose` validates definitions, providers, schemas, required methods and
extension relationships. It generates schema snapshots, lazy provider forwarding
functions and consumer types. Only one implementor per contract is permitted.

Development output is `.run/contracts/index.ts`; platform-only output is
`.generated/contracts/`. Web instrumentation and package scripts load the same
registry. Startup does not repeat discovery or eagerly load provider manifests.
Runtime calls still validate inputs and outputs.

After registration changes, run `npm run voyzu:compose -- --no-install`.
Dev, build and typecheck do not regenerate registries. Empty registries are valid;
optional package folders are not required.

The migration does not change database storage or external API DTOs. Internal
contracts use the semantic names and response shapes specified in the catalogues.

Historical command tests remain `.ts.disabled`. `npm run test:contracts` in the
package repository includes isolated runtime tests and the organization/Finance
integration test. The latter requires an initialized development database and
rolls back its writes.
