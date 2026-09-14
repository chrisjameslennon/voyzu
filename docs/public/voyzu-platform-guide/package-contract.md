# Package contract

HTTP API registration uses `contracts.httpApiRouting` (roots and routes keyed by stable ID, including operation descriptions) and `contracts.httpApiDocumentation` (sections, groups and ordered route references). Every route needs exactly one documentation entry. Section titles become package-qualified OpenAPI tags; route IDs become operation IDs. See the [HTTP API contract](../platform-contracts/http-api-contract.md) for the complete example. Module exports alone do not register HTTP routes.

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
├─ ui-surface/
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
    "settings": {
      "helpBaseUrl": "https://docs.acme.example/warehousing/"
    }
  },

  "exports": {
    "./voyzu-package": "./voyzu.package.ts",
    "./modules/stock": "./modules/stock/module.ts",
    "./stock/pages.routes": "./modules/stock/pages.routes.ts",
    "./stock/http-api.routes": "./modules/stock/http-api.routes.ts",
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

The composer reads application contracts through the package definition:

| Export | Purpose | Loading rule |
|---|---|---|
| `./voyzu-package` | Page routing, HTTP API and UI surface contracts | Page and handler loaders remain lazy. |
| `./ui-surface/left-nav-header` | Optional client header module referenced by a loader | Loaded lazily by the generated header registry. |

Page and HTTP routes are registered explicitly in package contracts. Navigation belongs to `contracts.uiSurface`. Composition reads `voyzu.package.ts` and preserves route IDs.

Page and HTTP API root paths reserve separate namespaces. A package may use the same root in both namespaces, but two packages cannot own overlapping roots within the same namespace. Use an empty object for page roots and an empty array for HTTP API roots when none are owned. The Voyzu platform itself is implicit and is not listed in `voyzu.dependencies`.

### `voyzu.package.ts`

`voyzu.package.ts` is the package lifecycle manifest. It composes the package's
modules and optional install, uninstall, and script registrations. Install and
script commands load this manifest deliberately. Composition reads its optional `contracts` section for page routing, HTTP APIs, internal APIs and UI surface contributions.

```ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { stockModule } from "./modules/stock/module";
import { pageRoutes } from "./modules/stock/pages.routes";
import { sampleData } from "./scripts/sample-data";
import { uninstall } from "./uninstall/manifest";

const packageDefinition = {
  contracts: { pageRouting: { roots: { "/warehousing": { routes: pageRoutes } } } },
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

`modules/` contains the package's application capabilities. Each module owns its routes, UI, services, persistence, and business validation. See the [Module contract](module-contract.md) for the detailed structure and rules.

```text
modules/
└─ stock/
   ├─ client/
   ├─ server/
   ├─ http-api.routes.ts
   ├─ module.ts
   └─ pages.routes.ts
```

`module.ts` is the module manifest and only composes the module contract:

```ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { pageRoutes } from "./pages.routes";

export const stockModule = {
  pageRoutes,
  
} as const satisfies VoyzuPackageModuleDefinition;
```

The module manifest remains useful to the package lifecycle contract and to
code that deliberately consumes the complete module definition. It is not a
route registry. Voyzu reads page routing and HTTP API contracts from `voyzu.package.ts`. Page and handler loaders remain lazy.

`pages.routes.ts` contains metadata and lazy page loaders. It must not import
page implementations eagerly:

```ts
export const pageRoutes = {
  "acme.warehousing.stock.page.list": {
    path: "/warehousing/stock",
    pageTitle: "Stock",
    loadPage: () => import("./server/pages/StockListPage")
      .then((module) => module.StockListPage),
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

Cross-package capabilities and master data are declared through the root manifest’s `contracts.defines` and `contracts.implements`. They are not discovered through `package.json` command exports. Same-package code imports its own services directly. See [Contracts](contracts.md).

## `ui-surface/`

Declare package contributions through `contracts.uiSurface`: `topnav.menu`, `leftnav.menu` and `leftnav.header`. Menu items and children are objects keyed by stable IDs. Each package owns its navigation; `/settings` is the shared menu exception. See the [UI surface contract](../platform-contracts/ui-surface-contract.md).

```ts
// voyzu.package.ts — other contracts omitted.
import leftNav from "./ui-surface/left-nav";

export default {
  contracts: {
    uiSurface: {
      "topnav.menu": {
        "warehousing": { label: "warehousing", routeId: "acme.warehousing.items.page.list" },
      },
      "leftnav.menu": {
        "/warehousing": { content: leftNav },
      },
    },
  },
};
```

```ts
// ui-surface/left-nav.ts
export default [{
  items: {
    "warehousing.list": { label: "List", routeId: "acme.warehousing.items.page.list" },
  },
}] as const;
```

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

`tests/` contains package-level integration tests. Contract integration tests exercise real providers, schema validation and shared-transaction rollback. Historical command tests are retained as `.ts.disabled` during migration, not rewritten. Tests must clean up their records, preferably using transaction rollback.

## `types/`

`types/` contains shared public DTO schemas and their inferred TypeScript types. Use TypeBox so the same contract supports runtime validation, HTTP API documentation, and static typing.

```ts
// types/stock-item.dto.ts
import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";

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
navigation, HTTP API, or semantic-contract fallback.

The two groups have separate generated files, but both are generated only by
explicit composition. Development startup loads them without regeneration:

| Surface | Pre-installed | Installed |
|---|---|---|
| Page routes | `apps/web/.generated/page-routes/pre-installed.ts` | `apps/web/.generated/page-routes/installed.ts` |
| HTTP API routes | `apps/web/.generated/http-api-routes/pre-installed.ts` | `apps/web/.generated/http-api-routes/installed.ts` |
| Navigation | `apps/web/.generated/navigation/pre-installed.ts` | `apps/web/.generated/navigation/installed.ts` |
| Left-nav headers | `apps/web/.generated/navigation/pre-installed-headers.tsx` | `apps/web/.generated/navigation/installed-headers.tsx` |
| Semantic contracts | Root `voyzu.package.ts` manifests + platform definitions | Workspace `contracts/index.ts` (or standalone `.generated/contracts/index.ts`), bridged by `apps/web/.generated/contracts/installed.ts` |

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
