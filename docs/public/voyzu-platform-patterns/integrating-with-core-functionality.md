# Integrating with other packages

Voyzu packages use the same dependency rules as ordinary npm packages. A
consumer may import only entry points deliberately exported by the package
that owns the capability.

## Import public package entry points

The provider declares its public surface in `package.json`:

```json
{
  "name": "@acme/inventory",
  "exports": {
    "./types": "./modules/types/index.ts",
    "./modules/stock/server": "./modules/stock/server/index.ts"
  }
}
```

Another package may then use those stable names:

```ts
// packages/@fred/purchasing/modules/orders/server/order.service.ts
import type { StockResponseDto } from "@acme/inventory/types";
import { getStock } from "@acme/inventory/modules/stock/server";
```

Do not import a provider's private source path:

```ts
// Incorrect: bypasses @acme/inventory's public contract.
import { StockRepo } from
  "@acme/inventory/modules/stock/server/db/stock.repo";
```

Public entry points should expose DTOs, service functions, and deliberately
shared constants. They should not expose repositories, database row types, or
private validators.

## Declare both forms of dependency

The consuming package must declare the provider in `package.json`, normally as
a peer dependency:

```json
{
  "peerDependencies": {
    "@acme/inventory": "^1.0.0"
  }
}
```

It must also list the package in `voyzu.dependencies` in `package.json`:

```json
{
  "voyzu": {
    "dependencies": ["@acme/inventory"],
    "pageRootPaths": ["/purchasing"],
    "apiRootPaths": ["/purchasing"]
  }
}
```

`package.json` controls JavaScript package resolution. The Voyzu dependency
list describes installation and composition order. Neither declaration
replaces the other.

Voyzu platform packages such as `@voyzu/types`, `@voyzu/capability`, and UI
packages remain ordinary peer dependencies, but the Voyzu platform itself is
implicit and is not listed in `voyzu.dependencies`.

## Prefer services to direct table access

Use the owning package's service contract for reads and mutations. This keeps
validation, authorization, auditing, and business rules in one place:

```ts
// packages/@fred/purchasing/modules/orders/server/order.service.ts
import { getStock } from "@acme/inventory/modules/stock/server";

const stock = await getStock(input.stockCode);
```

Never mutate another package's table directly.

A reporting query may join another package's table only when the schema
dependency is intentional, declared, and versioned. Treat this as tighter
coupling than a service call: the consumer becomes dependent on the provider's
database schema as well as its TypeScript contract.

## Avoid circular dependencies

Package dependencies must form a directed graph. If two packages need the same
contract or service, extract that capability into a third package rather than
making the packages depend on each other.

Keep module-to-module imports within one package explicit too. Reuse a
package-level public service where functionality is shared across several
modules.

## Keep server boundaries safe

Public server entry points used by services, scripts, and tests must remain
Node-safe. Do not re-export SSR page components from the same barrel if those
pages import `server-only`; export pages from a separate page entry point.

```ts
// packages/@acme/inventory/modules/stock/server/index.ts
export { getStock, listStock } from "./lib/stock.service";

// packages/@acme/inventory/modules/stock/server/pages/index.ts
export { StockListPage } from "./StockListPage";
```

This lets tests import service code without loading a Next.js-only marker.

## Shared framework contracts

Use `@voyzu/types` for framework-wide contracts such as package definitions,
filters, standard errors, operation blockers, and audit metadata. Do not copy
these interfaces into each package.

Domain-specific types remain owned by the domain package and must be exposed
through an explicit package export when they form part of another package's
contract.
