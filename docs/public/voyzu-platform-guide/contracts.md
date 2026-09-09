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

### Examples

Country data has separate owners for the base record and its Finance extension:

```text
platform.country
│  Defined by: Platform
│  Implemented by: Localization
│
└── erp.country.finance
       Defined by: ERP Core
       Implemented by: Finance
```

Localization supplies country data such as code and name. Finance supplies country
tax settings. ERP Core defines the named composition `erp.country`, which combines
their results:

```text
erp.country
├── country   ← Localization's base country data
└── finance   ← Finance's country tax settings
```

Organization follows the same ownership model, although ERP Core defines both the
root and the extension contract:

```text
erp.organization
│  Defined by: ERP Core
│  Implemented by: ERP Core
│
└── erp.organization.finance
       Defined by: ERP Core
       Implemented by: Finance
```

`masterData.compose("erp.organization", organizationId)` combines the organization
with its implemented extensions under `extensions`, including `extensions.finance`
when a Finance record exists. The `organization-composed.ts` interface describes
this result; it does not register a named composition.

The split preserves data ownership without coupling packages. Localization and
ERP Core remain usable without Finance, and neither needs to import Finance's
implementation or query its tables. A single combined contract would make its one
provider responsible for supplying both packages' data. Extensions instead let each
provider supply only its own portion while consumers request a combined result.

ERP Core owns the country composition as shared ERP vocabulary, not as the holder
of all its records. Finance could define a Finance-specific named composition
instead, referencing the same contract identities without importing Localization.

#### Peer extensions, not nested extensions

A package may implement one contract and define another extension for a different
package to implement. Multiple peer extensions attached directly to the same root
are supported:

```text
Organization
├── Finance       — implemented by Finance
└── FinanceExtra  — defined by Finance, implemented by another package
```

Extensions of extensions are not supported:

```text
Organization
└── Finance
    └── FinanceExtra  — nesting is rejected
```

Every extension must name a root contract, not another extension, as its parent.
Named compositions likewise select direct extensions of a root; they cannot nest
other compositions. Recursive extension support would require cycle detection,
nested result types and rules for missing parent-extension records. Use peer
extensions when separate ownership is sufficient; nesting is not needed merely
because one package defines a contract that another implements.

## Composition and scripts

### Users and current identity

Platform defines `platform.user` master data; Auth implements `get(code)` and `list()`.
It preserves the public user DTO, including numeric record ID, code, email, display
name, role, status, access mode, implementer access and audit metadata. Passwords and
password hashes are excluded. Lookup uses the existing user code, not the numeric ID.

`platform.identity.current({})` returns a smaller current-user snapshot with ID, code,
display name, role, status and access mode, plus actor type and permissions. Auth grants
`users.manage` and `audit.view` to active administrators. The separate identity `lookup`
method still returns only actor display information, not full user records.

ERP Core consumes these contracts without Auth imports. Organization assignments and
selection rules remain in ERP Core: current users must be active with UI access, and
standard users see only assigned organizations. Admin checks remain in both API handlers
and services. Master-data retrieval is an internal server interface, not a new public
endpoint or an authorization bypass; callers retain their access checks.

### Organization directory

Platform defines the optional `platform.organization-directory` capability with
`list({})`, returning `{ organizations: [{ id, code, name }] }`. ERP Core implements
the directory using its own repository. It includes active and inactive organizations,
but excludes deleted records; it is not a current-user organization selector.

Audit resolves it server-side with `capabilities.optional()` to supply filter options
and enrich recorded organization IDs in list, detail and export results. Audit retains
its existing authorization checks. Without an implementor, organization IDs remain
usable and filter options are empty. Missing/deleted records cannot supply historical
labels. Provider failures are not treated as an absent implementor.

This keeps the platform independent of ERP-owned schemas, services, tables and HTTP
routes. The directory does not change audit recording or add a database foreign key.

### Named master-data compositions and listing

Base data, extensions and named compositions are distinct declarations. Platform owns
`platform.country`; Localization implements its retrieval. ERP Core defines
`erp.country.finance`, and Finance implements it using the existing country tax
settings shape. No consumer imports the provider or another package's schema.

ERP Core declares the business view in `contracts.defines.compositions`:

```ts
const compositions = {
  "erp.country": {
    root: "platform.country",
    extensions: ["erp.country.finance"],
  },
} as const;

await masterData.get("platform.country", "NZ"); // Base country DTO or null
await masterData.get("erp.country", "NZ"); // { country, finance } or null
await masterData.list("platform.country"); // Complete country DTO array
await masterData.get("platform.currency", "NZD"); // Complete currency DTO or null
await masterData.list("platform.currency"); // Complete currency DTO array
```

A named composition references an existing root and extension identities; it does
not copy the base schema or have its own provider. Compose validates references,
name collisions and result-key collisions. Nested compositions are not supported.
Every named extension requires an implementor at call time, even if the root record
does not exist. An absent root returns null; an absent extension record is represented
by a null value under its declared key. This differs from the older ad hoc `compose`
method's optional `extensions` object, which remains unchanged.

Collection retrieval is opt-in: declare `list: true` on the master-data contract and
implement `list: () => Promise<Data[]>` alongside `get`. It returns the unfiltered
collection in provider order, with every record validated. There is no pagination,
filtering or named-composition listing in this initial API. Country listing preserves
the existing report's behaviour, including inactive countries.

Platform also defines `platform.currency`, implemented by Localization. Its existing
string identifiers, optional symbol, status and audit metadata are preserved. Listing
keeps provider ordering and inactive records; callers apply their existing active-only
selection filters. Currency has no extensions or named composition at present.

Declarations stay at the owner's top-level `contracts/`. The generated runtime
supplies consumer types, including named result keys and nullable extension records.

Development composition writes `.run/contracts/index.ts`, containing registration plus generated TypeScript map augmentation. Web instrumentation imports a generated bridge; the package script runner imports the same registry. Platform-only composition uses `.generated/contracts/` to avoid overwriting platform-owned definitions.

Compose resolves providers and validates contract structure, schemas, duplicates and extension relationships. Generated configuration contains schema snapshots and lazy provider imports. Startup loads these maps without importing package manifests eagerly or repeating composition validation. Request/response validation and transaction handling still run when contracts are called. Provider implementations are loaded on first use.

Dev, build and typecheck no longer generate registries implicitly. Next configuration checks only required generated entry points and asks you to run compose if they are missing. Empty feature registries are valid; optional package folders are not required. Routes added to an already-composed route module still update through development file watching; adding a new route module requires compose.

Run `npm run voyzu:compose -- --no-install` after changing contract definitions or providers. Chokidar copies package files but does not replace contract registration generation. Generated files are not source contracts.

The initial organization and finance schemas preserve every existing DTO field and numeric ID. The financial-entity storage model, service names and existing APIs remain unchanged.

Legacy command tests are retained as `.ts.disabled`, not rewritten. The new organization/Finance test lives under ERP Core `tests/contracts/` and can be run from the package-development repository with `npm run test:contracts`. It uses a real initialized database and rolls back its writes.
