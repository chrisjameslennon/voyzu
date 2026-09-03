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
    "./navigation": "./navigation/index.ts",
    "./modules/stock": "./modules/stock/module.ts",
    "./stock/pages.routes": "./modules/stock/pages.routes.ts",
    "./stock/api.routes": "./modules/stock/api.routes.ts",
    "./stock/commands": "./modules/stock/commands.ts",
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

The composer discovers application surfaces from exports with these exact
shapes:

| Export | Purpose | Loading rule |
|---|---|---|
| `./<module>/pages.routes` | Browser page declarations | Each route provides a lazy `loadPage` function. |
| `./<module>/api.routes` | HTTP route declarations | Each route provides a lazy `loadHandler` function. |
| `./<module>/commands` | Cross-package command declarations | Each command should use `command.defineLazy`. |
| `./navigation` | Optional package navigation declaration | May import route manifests for their IDs, but not page, handler, or service implementations. |
| `./navigation/left-nav-header` | Optional client left-navigation header | Composed into the separate header registry. |

These exports are the composition boundary. The composer does not fall back to
loading `voyzu.package.ts`, `module.ts`, package barrels, server barrels, or
implementation files to find routes or commands. A package that owns page or
API roots must export the corresponding route surfaces.

Page and API root paths reserve separate namespaces. A package may use the same root in both namespaces, but two packages cannot own overlapping roots within the same namespace. Use an empty array when the package owns no roots. The Voyzu platform itself is implicit and is not listed in `voyzu.dependencies`.

### `voyzu.package.ts`

`voyzu.package.ts` is the package lifecycle manifest. It composes the package's
modules and optional install, uninstall, and script registrations. Install and
script commands load this manifest deliberately; route, navigation, and
command composition do not use it for discovery.

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

`modules/` contains the package's application capabilities. Each module owns its routes, commands, UI, services, persistence, and business validation. See the [Module contract](module-contract.md) for the detailed structure and rules.

```text
modules/
└─ stock/
   ├─ client/
   ├─ server/
   ├─ api.routes.ts
   ├─ module.ts
   ├─ commands.ts
   └─ pages.routes.ts
```

`module.ts` is the module manifest and only composes the module contract:

```ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { commands } from "./commands";
import { pageRoutes } from "./pages.routes";

export const stockModule = {
  pageRoutes,
  apiDefinitions,
  commands,
} as const satisfies VoyzuPackageModuleDefinition;
```

The module manifest remains useful to the package lifecycle contract and to
code that deliberately consumes the complete module definition. It is not a
route or command registry. Voyzu imports the separately exported
`pages.routes.ts`, `api.routes.ts`, and `commands.ts` surfaces when composing
the application, so none of those generated registrations pulls in
`module.ts` or `voyzu.package.ts`.

`pages.routes.ts` contains metadata and lazy page loaders. It must not import
page implementations eagerly:

```ts
export const pageRoutes = {
  list: {
    id: "acme.warehousing.stock.page.list",
    path: "/warehousing/stock",
    pageTitle: "Stock",
    loadPage: () => import("./server/pages/StockListPage")
      .then((module) => module.StockListPage),
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

`commands.ts` is the module's public command surface. It declares TypeBox
contracts and lazy typed service loaders so registering a command does not load
its service or the rest of its package. Cross-package callers use the composed
command registry; API handlers continue to call services directly.

## `navigation/`

`navigation/` contributes top and left navigation. Navigation entries refer to registered route IDs rather than duplicating URL paths.

```text
navigation/
├─ index.ts
├─ left-nav.ts
└─ top-nav.ts
```

```ts
// navigation/index.ts
import leftNav from "./left-nav";
import topNav from "./top-nav";

export const navigation = { topNav, leftNav } as const;
export default navigation;
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

A package spanning multiple navigation domains returns `domains` from the same
`./navigation` export instead. Each domain declares its label, entry route,
owned route IDs, and left navigation. There are no separate composer fallbacks
for legacy `./navigation/top-nav`, `./navigation/left-nav`, or
`./navigation/domains` exports.

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

`tests/` contains package-level tests. Command tests mirror the public commands surface by module.

```text
tests/
└─ commands/
   └─ stock/
      └─ stock.commands.test.ts
```

```ts
import { describe, expect, it } from "vitest";
import { commands } from "../../../modules/stock/commands";

describe("stock commands", () => {
  it("returns a stock item", async () => {
    const item = await commands.getStockItem("ITEM-001");
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

Voyzu composes both pre-installed platform packages and independently installed
packages through the same package descriptor, surface validation, route types,
lazy-loading rules, and generated registry shapes. Pre-installed packages are
regular conforming packages that happen to ship in the Voyzu repository and
participate in platform initialization. They declare `voyzu.preinstalled: true`;
independently installed packages must not. Their code receives no route,
navigation, API, or command fallback.

The two groups are written separately so ordinary development startup can
refresh platform output without erasing an installed-package composition:

| Surface | Pre-installed | Installed |
|---|---|---|
| Page routes | `apps/web/.generated/page-routes/pre-installed.ts` | `apps/web/.generated/page-routes/installed.ts` |
| API routes | `apps/web/.generated/api-routes/pre-installed.ts` | `apps/web/.generated/api-routes/installed.ts` |
| Navigation | `apps/web/.generated/navigation/pre-installed.ts` | `apps/web/.generated/navigation/installed.ts` |
| Left-nav headers | `apps/web/.generated/navigation/pre-installed-headers.tsx` | `apps/web/.generated/navigation/installed-headers.tsx` |
| Commands | `apps/web/.generated/commands/pre-installed.ts` | `apps/web/.generated/commands/installed.ts` |

Voyzu derives these transient registries, installs the resulting dependencies,
and copies public assets. Package authors edit package source only; generated
composition files must not be edited.

```text
packages/@acme/warehousing/        <- package source
              |
              v compose
.run/packages/@acme/warehousing/   <- transient runtime package
```

For a complete working example, see the Ice Creams reference package in the Voyzu Packages repository.
