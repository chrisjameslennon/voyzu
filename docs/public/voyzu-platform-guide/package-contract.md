# Package contract

## Package structure

### Package identity

A Voyzu package must have a scoped npm name in the form `@publisher/package-name`. The publisher and package name must be valid, stable directory names. This npm name as it appears in `package.json` is the package's authoritative identity.

Example:

```
@acme/warehousing
```

### Source location

A package must reside at `packages/@publisher/package-name` within its Git repository. Its directory path must exactly match the `name` in its `package.json`.

Example:

```
packages/
└─ @acme/
   └─ warehousing/
      └─ package.json       # "name": "@acme/warehousing"
```

### Package boundary

Package source, installation files, scripts and permanent configuration must remain inside the package directory. A package must not depend on generated files beneath `.run` or write permanent source into the Voyzu Platform runtime.

Example:

```
packages/@acme/warehousing/
├─ install/
├─ modules/
├─ navigation/
├─ scripts/
├─ package.json
└─ voyzu.package.ts
```

## `package.json` entries

### Package metadata

A package must contain `package.json`, use ES modules and declare itself as a Voyzu package. `voyzu.allowInstall` must be `true` before Voyzu will install the package; it does not represent runtime status.

Dependencies are the voyzu packages this package depends on.

Example:

```json
{
  "name": "@acme/warehousing",
  "version": "0.1.0",
  "description": "Warehouse and stock management for Voyzu.",
  "repository": "https://github.com/acme/warehouse-packages.git",
  "private": true,
  "type": "module",
  "voyzu": {
    "voyzu-package": true,
    "allowInstall": true,
    "dependencies": [],
    "pageRootPaths": ["/warehousing"],
    "apiRootPaths": ["/warehousing"],
    "settings": {
      "helpBaseUrl": "https://docs.example.com/"
    }
  }
}
```

### Required exports

A package must export its package definition through the standard export name. Each additional declared export must resolve to the corresponding package-owned source file.

Example:

```json
{
  "exports": {
    "./voyzu-package": "./voyzu.package.ts"
  }
}
```

### Public exports

Code intended for use by another package must be exposed explicitly through `package.json` exports. A consuming package must not import another package's private file paths.

Example:

```json
{
  "exports": {
    "./modules/stock/server": {
      "types": "./modules/stock/server/index.ts",
      "import": "./modules/stock/server/index.ts"
    }
  }
}
```

```ts
import { StockService } from "@acme/warehousing/modules/stock/server";
```

### npm dependencies

A package must declare ordinary runtime requirements in `dependencies` and host-provided requirements in `peerDependencies`. Development-only `file:` paths must not be used as distributable package dependencies. See [Managing dependencies](../voyzu-platform-patterns/managing-dependencies.md).

Example:

```json
{
  "dependencies": {
    "cat-names": "^0.0.1"
  },
  "peerDependencies": {
    "@voyzu/audit": "^0.1.0",
    "@voyzu/types": "^0.1.0",
    "next": "^16",
    "react": "^19"
  }
}
```

### Voyzu package dependencies

The `voyzu` metadata in `package.json` must contain a `dependencies` array, even when the package has no package-level dependencies. A dependency must use the depended-on package's scoped npm name. Voyzu itself is an implicit dependency and must not be listed.

Example:

```json
{
  "voyzu": {
    "dependencies": ["@acme/inventory"]
  }
}
```

### Page and API root paths

A package must separately declare the page and API URL namespaces it owns. Root paths reserve namespaces; they do not create routes. Actual page and API routes are registered by the package's modules.

#### Page root paths

`voyzu.pageRootPaths` contains the package's browser-facing page namespaces. Every page route registered by the package must equal one of these roots or be a child of one.

For example, a page root of `/warehousing` permits module page routes such as:

```text
/warehousing
/warehousing/stock
/warehousing/stock/{code}
```

It does not permit a page route beneath `/purchasing` unless `/purchasing` is also declared as a page root.

Page-route visibility is managed independently after installation. Hiding a package's page routes prevents direct access to its registered pages. Hiding its top-navigation items is a separate setting and does not hide its pages.

#### API root paths

`voyzu.apiRootPaths` contains the package's API namespaces relative to Voyzu's shared `/api` prefix. Every API route registered by the package must equal one of these roots or be a child of one.

For example, this declaration:

```json
{
  "voyzu": {
    "apiRootPaths": ["/warehousing"]
  }
}
```

permits module API paths such as `/warehousing/stock` and `/warehousing/stock/{code}`. Callers use the external URLs `/api/warehousing/stock` and `/api/warehousing/stock/{code}`.

API routes have no package visibility setting. Hiding top navigation or page routes does not disable a package's APIs.

#### Uniqueness and overlap

Page and API roots are separate routing spaces and may use the same value within one package. Across packages, roots in the same routing space must not overlap. Installation and development linking reject both exact duplicates and nested collisions such as `/warehousing` and `/warehousing/reports`. A package with no routes of a given kind must declare an empty array.

Example:

```json
{
  "voyzu": {
    "pageRootPaths": ["/warehousing", "/stock-reports"],
    "apiRootPaths": ["/warehousing"]
  }
}
```

### Package settings

A package that supplies page help must declare its documentation base URL at `voyzu.settings.helpBaseUrl` in `package.json`. Page routes supply only their package-relative `helpPath`; Voyzu combines the two values when rendering the Help action. The base may use GitBook or any other HTTP or HTTPS documentation provider.

Example:

```json
{
  "voyzu": {
    "settings": {
      "helpBaseUrl": "https://docs.example.com/"
    }
  }
}
```

See [Documentation and help](../voyzu-platform-patterns/documentation-and-help.md) for the documentation source and contextual Help pattern.

## `voyzu.package.ts` entries

### Package definition

A package must contain `voyzu.package.ts` and default-export an object conforming to `VoyzuPackageDefinition`. The definition must provide `modules`. A normal package must register at least one module. An install-only package may use an empty `modules` array when it declares at least one database installation file. Package identity, version and description belong only in `package.json`.

Example:

```ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { stockModule } from "./modules/stock/module";

export const warehousingPackage = {
  modules: [stockModule],
} as const satisfies VoyzuPackageDefinition;

export default warehousingPackage;
```

### Module registration

A package that provides application functionality must register at least one module in `voyzu.package.ts`. Only modules present in the `modules` collection are composed into the page and API registries. Every registered module must satisfy the [module contract](module-contract.md). An install-only package may declare `modules: []` and contributes no page or API routes.

Example:

```ts
modules: [
  stockModule,
  warehouseReportsModule,
  warehouseAuditModule,
],
```

Install-only example:

```ts
// packages/@acme/database-foundation/voyzu.package.ts
export default {
  modules: [],
  install: {
    sql: ["./install/db/sql/domains.sql"],
  },
};
```

### Database installation

A package that owns database objects may declare ordered `sql` and `seedSql` files. Paths must be relative to the package and must not escape its directory. Voyzu executes `sql` first and `seedSql` second, in declared order. Installation SQL must be safe to run again when a package is updated.

Example:

```ts
install: {
  sql: [
    "./install/db/sql/warehouse.sql",
    "./install/db/sql/stock-item.sql",
  ],
  seedSql: [
    "./install/db/seed/warehouse.seed.sql",
  ],
},
```

### Database uninstallation

A package may declare ordered `uninstall.sql` files that reverse its database installation. Voyzu executes the files in one transaction before removing the installed package copy. Package uninstall SQL must leave platform-owned audit records intact.

```ts
uninstall: {
  sql: [
    "./uninstall/db/sql/drop-stock-item.sql",
    "./uninstall/db/sql/drop-warehouse.sql",
  ],
},
```

### Package scripts

A package may expose callable methods through the `scripts` object in `voyzu.package.ts`. Script entries must be functions, not command strings. Standard package scripts include `sampleData`. Uninstallation is a dedicated package lifecycle rather than a general-purpose script.

Example:

```ts
import { install as installSampleData } from "./scripts/sample-data/install";

scripts: {
  sampleData: installSampleData,
},
```

```shell
npm run voyzu:run-script -- @acme/warehousing sampleData
```

## Navigation

### Top navigation

A single-domain package may export one or more top-navigation definition. When present, its `routeId` must identify one page route belonging to a registered module. That route becomes the package's default surface route. A server-only package may omit top navigation.

Example:

```ts
import { stockModule } from "../modules/stock/module";

const topNav = {
  label: "Warehousing",
  routeId: stockModule.pageRoutes.list.id,
} as const;

export default topNav;
```

### Multiple navigation domains

A package that provides more than one top-navigation domain must export `./navigation/domains` instead of the single-domain top- and left-navigation exports. Each domain must declare its label, default `routeId`, complete `routeIds` collection and left navigation. A domain may include a route owned by a preinstalled Voyzu package when that route is deliberately presented within the domain.

Example:

```json
{
  "exports": {
    "./navigation/domains": "./navigation/domains.ts"
  }
}
```

```ts
// packages/@acme/operations/navigation/domains.ts
import type { VoyzuPackageNavigationDomain } from "@voyzu/types/framework";
import { inventoryModule } from "../modules/inventory/module";
import { manufacturingModule } from "../modules/manufacturing/module";
import { inventoryLeftNav } from "./inventory.left-nav";
import { manufacturingLeftNav } from "./manufacturing.left-nav";

export default [
  {
    label: "Inventory",
    routeId: inventoryModule.pageRoutes.list.id,
    routeIds: [inventoryModule.pageRoutes.list.id],
    leftNav: inventoryLeftNav,
  },
  {
    label: "Manufacturing",
    routeId: manufacturingModule.pageRoutes.list.id,
    routeIds: [manufacturingModule.pageRoutes.list.id],
    leftNav: manufacturingLeftNav,
  },
] as const satisfies readonly VoyzuPackageNavigationDomain[];
```

### Left navigation

A single-domain package may export a left-navigation array. A multi-domain package must declare a separate left-navigation array for each domain in its domain collection. Every navigation item must refer to a page route by `routeId`; it must not duplicate the route path. A package without a user interface may omit left navigation.

Example:

```ts
import { stockModule } from "../modules/stock/module";

const leftNav = [
  {
    items: [
      {
        label: "Stock",
        icon: "inventory",
        routeId: stockModule.pageRoutes.list.id,
      },
    ],
  },
] as const;

export default leftNav;
```

## Static assets

### Public assets

A package may provide static web assets in a package-root `public-assets` directory. Composition copies the directory contents into the Next.js public directory beneath a path named after the full scoped package name. Package assets must be referenced using that package-owned URL namespace.

```
packages/@acme/warehousing/
└─ public-assets/
   └─ warehouse-logo.svg

.run/voyzu/apps/web/public/
└─ @acme/
   └─ warehousing/
      └─ warehouse-logo.svg
```

The example asset is served at `/@acme/warehousing/warehouse-logo.svg`. Composition replaces the package's complete published asset directory so renamed and deleted files do not remain in the runtime. Uninstall composition removes the uninstalled package's published assets.

See [Static assets](../voyzu-platform-patterns/static-assets.md) for the complete lifecycle and usage pattern.

## Installation and composition

### Installation mode

A deployed package must be copied from a downloaded Git repository into `.run/packages`. A package under local development may be linked from the root `packages` workspace. The package contract must be identical in either mode.

Example:

```
production:
  .package-sources/acme-voyzu/packages/@acme/warehousing
      -> copied to .run/packages/@acme/warehousing

development:
  packages/@acme/warehousing
      -> linked at .run/packages/@acme/warehousing
```

### Composition

An installed package must be composable without manual edits to the Voyzu Platform. Voyzu derives workspace dependencies, Next.js transpilation, page routes, API routes and navigation from the installed package contract. Generated composition files must not be edited by the package.

Example:

```shell
npm run voyzu:compose
```

## Documentation

### Documentation layout

A package must keep its overview in a root `README.md`. All other package documentation should reside in a package-root `docs` directory. Documentation intended for users or publication as online help should reside in `docs/public`. See [Documentation and help](../voyzu-platform-patterns/documentation-and-help.md) for more information.

```
packages/@acme/warehousing/
├─ README.md
├─ docs/
│  ├─ architecture.md
│  └─ public/
│     ├─ README.md
│     └─ stock-items.md
├─ package.json
└─ voyzu.package.ts
```

### Voyzu patterns

A package should follow the established Voyzu patterns for data, APIs, application surfaces, validation, auditing, integration and testing unless the package documents a deliberate exception.

Example:

See the patterns for [data](../voyzu-platform-patterns/data.md), [APIs](../voyzu-platform-patterns/api-patterns.md), [application surfaces](../voyzu-platform-patterns/app-surface.md), [validation](../voyzu-platform-patterns/validation-layers.md), [auditing](../voyzu-platform-patterns/auditing-patterns.md), and [testing](../voyzu-platform-patterns/tests.md).

### Reference package

The Voyzu Ice Creams package conforms to this contract and demonstrates many of the established package and application patterns in use.

[View the Ice Creams reference package on GitHub](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams)
