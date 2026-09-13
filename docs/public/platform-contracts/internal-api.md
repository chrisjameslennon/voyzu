# Internal API

Server-side, same-runtime calls to package-owned and platform-owned (`@core`) resources. This API exists alongside semantic contracts.

## Definition

A module exports `defines` and `implements`. Definitions contain a TypeBox `dataDefinition` and named `methods`, each with `input` and `output` schemas. Data interfaces contain properties only; separate method interfaces describe the operations. Files use `.definition.ts` and `.implementation.ts` respectively.

`voyzu.package.ts` aggregates these under `contracts`:

```ts
contracts: {
  defines: { ...customersModule.defines },
  implements: { ...customersModule.implements },
}
```

Each implementation is a lazy loader returning the object's methods. Commercial defines and implements its price lists. Platform's Business Objects package defines `@core/customer/account`; Commercial implements it without redefining it. Only Platform's Business Objects package may define `@core` resources. Each resource has at most one implementation.

Loaders receive an internal API invoker for dependencies. Platform's Customer loader uses it to obtain Commercial's account data, without importing Commercial. A missing Party or account record returns `null` for the Customer; a missing account implementation throws an error.

The earlier `internalApi` array remains supported for compatibility.

## Calls

```ts
import { internalApi } from "@voyzu/capability/internal-api";

const item = await internalApi.call(
  "@voyzu/commercial/customer-price-list-items",
  "get",
  { id: 1 },
);

// Inferred from the output schema; no import from Commercial is needed.
const price = item?.price;
```

Input and output are validated at runtime. Unknown resources and methods throw errors. A missing record is represented by the method's output contract; the mock `get` method permits `null`.

## Composition and Loading

`voyzu:compose` validates registration and generates `.run/internal-api/index.ts` plus the web application's generated bridge. The index contains schema metadata, type-only imports for caller inference, and lazy provider loaders. No provider is invoked during composition or registration. Implementations are loaded on first use and cached for that registry. Undefined contracts, duplicate definitions and duplicate implementations fail composition. Missing methods fail when the provider loads.

The web server loads the generated registry during initialization. Core definitions are included even without installed extension providers; calling an unimplemented resource throws an error. Registration replaces the previous registry on reload.

The targeted composer is `lib/runtime-tools/compose/compose-internal-api.ts`. It accepts the runtime root, workspace root and package descriptors (JSON, or `@file`). The descriptors use `{ name, directory }` and should cover all packages in that workspace, since this rebuilds the complete internal API registry without composing other surfaces.

## Transactions and Authorization

A method may set `transactional: true`. It then uses the platform transaction context, joining an existing transaction or starting one. Output validation runs before commit. Authorization remains the handler's responsibility; registration does not grant permission to perform an operation.

Commercial's initial `get` and `update` providers use mock data, do not open transactions and do not persist updates.
