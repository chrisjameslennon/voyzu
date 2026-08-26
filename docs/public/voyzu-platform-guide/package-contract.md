# Package contract

A Voyzu package is a self-contained unit of functionality made up of one or more modules. Its scoped package name determines its source location:

```text
@acme/warehousing
└─ packages/@acme/warehousing/
```

A complete package can contain the following entries. Only `package.json`, `voyzu.package.ts`, and `modules/` are normally required; the remaining entries are added when the package needs them.

```text
packages/@acme/warehousing/
├─ docs/
├─ install/
├─ modules/
├─ navigation/
├─ public-assets/
├─ scripts/
├─ tests/
├─ types/
├─ uninstall/
├─ package.json
├─ README.md
└─ voyzu.package.ts
```

## Root files

### `package.json`

`package.json` identifies the package, declares its Voyzu contract, and exposes its public entry points. The directory path must match the scoped `name`.

The scoped package name is the package's authoritative identity. Its publisher and package-name segments must exactly match the directories beneath `packages/`.

```text
package.json name:  @acme/warehousing
source directory:   packages/@acme/warehousing/
```

The following is illustrative JSON with comments. Remove the comments in a real `package.json` file.

```jsonc
{
  "name": "@acme/warehousing",          // Must match packages/@acme/warehousing/.
  "version": "1.0.0",
  "description": "Warehouse management.",
  "repository": "https://github.com/acme/warehousing",
  "private": true,
  "type": "module",                    // Voyzu packages use ES modules.

  "voyzu": {
    "voyzu-package": true,               // Marks this as a Voyzu package.
    "allowInstall": true,
    "dependencies": ["@acme/products"], // Other Voyzu packages, not npm packages.
    "pageRootPaths": ["/warehousing"],  // Browser route namespaces owned here.
    "apiRootPaths": ["/warehousing"],   // API route namespaces owned here.
    "settings": {
      "helpBaseUrl": "https://docs.acme.example/warehousing/"
    }
  },

  "exports": {
    "./voyzu-package": "./voyzu.package.ts",
    "./navigation/top-nav": "./navigation/top-nav.ts",
    "./navigation/left-nav": "./navigation/left-nav.ts",
    "./stock": "./modules/stock/module.ts",
    "./stock/api.routes": "./modules/stock/api.routes.ts",
    "./stock/operations": "./modules/stock/operations.ts",
    "./types": "./types/index.ts"
  },

  "dependencies": {
    "typebox": "^1.3.0"
  },
  "peerDependencies": {
    "@voyzu/types": "*"
  }
}
```

Only paths declared in `exports` are public. Do not use filesystem dependencies or expose private implementation files.

Page and API root paths reserve separate namespaces. A package may use the same root in both namespaces, but two packages cannot own overlapping roots within the same namespace. Use an empty array when the package owns no roots. The Voyzu platform itself is implicit and is not listed in `voyzu.dependencies`.

### `voyzu.package.ts`

`voyzu.package.ts` is the package manifest. It composes the package's modules and optional lifecycle and script registrations.

```ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { stockModule } from "./modules/stock/module";
import { sampleData } from "./scripts/sample-data";
import { uninstall } from "./uninstall/manifest";

const packageDefinition = {
  modules: [stockModule],
  install,
  uninstall,
  scripts: { sampleData },
} as const satisfies VoyzuPackageDefinition;

export default packageDefinition;
```

A functional package normally declares at least one module. A package used solely for installation infrastructure may declare `modules: []`.

### `README.md`

`README.md` gives package consumers a short overview, its main capabilities, and links to further documentation.

```md
# @acme/warehousing

Warehouse stock, locations, transfers, and inventory operations for Voyzu.

See [package documentation](./docs/README.md).
```

## `docs/`

`docs/` contains detailed package documentation. Place material intended for the published help site under `docs/public/`.

```text
docs/
├─ public/
│  └─ warehouse-setup.md
└─ architecture.md
```

For example, `docs/public/warehouse-setup.md` can explain user-facing setup while `docs/architecture.md` records internal package design decisions.

## `install/`

`install/` owns the package's database objects, seed data, and installation manifest. Installation must be rerunnable and declares execution order explicitly.

```text
install/
├─ db/
│  ├─ sql/
│  │  └─ warehouse.sql
│  └─ seed/
│     └─ warehouse.seed.sql
└─ manifest.ts
```

```ts
export const install = {
  sql: ["./install/db/sql/warehouse.sql"],
  seedSql: ["./install/db/seed/warehouse.seed.sql"],
} as const;
```

Voyzu runs object SQL before seed SQL, using the order declared in each array.

## `modules/`

`modules/` contains the package's application capabilities. Each module owns its routes, operations, UI, services, persistence, and business validation. See the [Module contract](module-contract.md) for the detailed structure and rules.

```text
modules/
└─ stock/
   ├─ client/
   ├─ server/
   ├─ api.routes.ts
   ├─ module.ts
   ├─ operations.ts
   └─ pages.routes.ts
```

`module.ts` is the module manifest and only composes the module contract:

```ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { operations } from "./operations";
import { pageRoutes } from "./pages.routes";

export const stockModule = {
  pageRoutes,
  apiDefinitions,
  operations,
} as const satisfies VoyzuPackageModuleDefinition;
```

`operations.ts` is the module's public command surface. It declares TypeBox
contracts and lazy typed service loaders so registering a command does not load
its service or the rest of its package. Cross-package callers use the composed
command registry; API handlers continue to call services directly.

## `navigation/`

`navigation/` contributes top and left navigation. Navigation entries refer to registered route IDs rather than duplicating URL paths.

```text
navigation/
├─ left-nav.ts
└─ top-nav.ts
```

```ts
// navigation/top-nav.ts
export default {
  label: "Warehousing",
  icon: "warehouse",
  routeId: "stock.list",
} as const;

// navigation/left-nav.ts
export default [
  {
    items: [
      {
        label: "Stock",
        icon: "inventory",
        routeId: "stock.list",
      },
    ],
  },
] as const;
```

A package spanning multiple navigation domains exports `./navigation/domains` instead. Each domain declares its label, entry route, owned route IDs, and left navigation.

## `public-assets/`

`public-assets/` contains static files copied into the composed web application. Voyzu gives them a package-scoped URL to avoid collisions.

```text
public-assets/
└─ images/
   └─ warehouse-map.svg
```

```text
Source: public-assets/images/warehouse-map.svg
URL:    /@acme/warehousing/images/warehouse-map.svg
```

Composition replaces the package's copied assets, and uninstall removes them.

## `scripts/`

`scripts/` contains package maintenance or setup functions exposed through the package manifest. Scripts are callable tasks, not command-line programs.

```ts
// scripts/sample-data.ts
export async function sampleData(): Promise<void> {
  await seedWarehouseSampleData();
}
```

After registering `sampleData` in `voyzu.package.ts`, run it with:

```powershell
npm run voyzu:run-script @acme/warehousing sampleData
```

## `tests/`

`tests/` contains package-level tests. Operation tests mirror the public operations surface by module.

```text
tests/
└─ operations/
   └─ stock/
      └─ stock.operations.test.ts
```

```ts
import { describe, expect, it } from "vitest";
import { operations } from "../../../modules/stock/operations";

describe("stock operations", () => {
  it("returns a stock item", async () => {
    const item = await operations.getStockItem("ITEM-001");
    expect(item.code).toBe("ITEM-001");
  });
});
```

Tests must clean up records they create unless the retained record is an intentional audit record.

## `types/`

`types/` contains shared public DTO schemas and their inferred TypeScript types. Use TypeBox so the same contract supports runtime validation, API documentation, and static typing.

```ts
// types/stock-item.dto.ts
import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const StockItemDto = StrictObject({
  code: Type.String({ maxLength: 30 }),
  description: Type.String(),
});

export type StockItemDto = Type.Static<typeof StockItemDto>;
```

```ts
// types/index.ts
export { StockItemDto } from "./stock-item.dto";
```

Expose public types through `package.json`; keep service and persistence-only types private.

## `uninstall/`

`uninstall/` owns the optional removal manifest and SQL. Removal runs in declared order within one transaction, normally reversing installation dependencies.

```text
uninstall/
├─ db/
│  └─ sql/
│     └─ drop-warehouse.sql
└─ manifest.ts
```

```ts
export const uninstall = {
  sql: ["./uninstall/db/sql/drop-warehouse.sql"],
} as const;
```

Uninstall SQL removes package-owned data and database objects but must preserve platform audit history.

## Composition boundary

Voyzu composes installed packages into the runtime workspace, derives generated routing and navigation files, installs the resulting dependencies, and copies public assets. Package authors edit package source only; generated composition files are transient and must not be edited.

```text
packages/@acme/warehousing/        <- package source
              |
              v compose
.run/packages/@acme/warehousing/   <- transient runtime package
```

For a complete working example, see the Ice Creams reference package in the Voyzu Packages repository.
