# Internal API

Server-side, same-runtime calls to package-owned resources. This API exists alongside semantic contracts.

## Definition

A module exports a `internalApi` array from `internal-api.ts`. Each resource has a fully qualified name, such as `@voyzu/commercial/customer-price-list-items`, and named methods. Each method declares TypeBox `input` and `output` schemas and a `loadHandler` function. `defineInternalApiMethod` checks the handler against those schemas at compile time.

The module exposes the array, and `voyzu.package.ts` flattens the module arrays into its own `internalApi` array. Resources must belong to the declaring package's namespace.

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

`voyzu:compose` validates registration and generates `.run/internal-api/index.ts` plus the web application's generated bridge. The index contains schema metadata, type-only imports for caller inference, and lazy provider loaders. No provider is invoked during composition or registration. The package definition and its handler are imported on the first call that needs them.

The web server loads the generated registry during initialization. An empty resource array is valid. Registration replaces the previous registry on reload.

The targeted composer is `lib/runtime-tools/compose/compose-internal-api.ts`. It accepts the runtime root, workspace root and package descriptors (JSON, or `@file`). The descriptors use `{ name, directory }` and should cover all packages in that workspace, since this rebuilds the complete internal API registry without composing other surfaces.

## Transactions and Authorization

A method may set `transactional: true`. It then uses the platform transaction context, joining an existing transaction or starting one. Output validation runs before commit. Authorization remains the handler's responsibility; registration does not grant permission to perform an operation.

Commercial's initial `get` and `update` providers use mock data, do not open transactions and do not persist updates.
