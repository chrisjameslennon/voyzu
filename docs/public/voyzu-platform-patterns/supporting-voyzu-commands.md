# Supporting Voyzu commands

Voyzu packages participate in installation, composition, development linking,
API documentation generation, builds, and optional ad hoc scripts. Most of
these commands do not require custom command code in the package. A package
supports them by following the package contract and keeping its declared files,
exports, dependencies, modules, and lifecycle SQL valid.

This page describes the package author's responsibilities. See the
[Commands guide](../voyzu-platform-guide/commands.md) for the complete command
reference and operator instructions.

## Package-facing commands

| Command | How the package participates |
|---|---|
| `npm run voyzu:install -- <github-address> <package-name>` | Voyzu downloads or refreshes the repository, copies the named package into the runtime, installs its dependencies, applies its declared installation SQL, and composes the application. |
| `npm run voyzu:install-package -- <package-name>` | Performs the same package installation lifecycle using a repository already downloaded beneath `.package-sources`. |
| `npm run voyzu:link-package -- <package-name>` | In a development runtime, copies one local package from `packages`, applies its installation SQL, composes it, and enables source mirroring while the development server runs. |
| `npm run voyzu:link-packages` | Links every installable local package, installs dependencies, applies each package's SQL, and composes once. |
| `npm run voyzu:uninstall-package -- <package-name>` | Applies declared uninstall SQL in one transaction, removes the runtime package copy, and recomposes the application. |
| `npm run voyzu:compose` | Reads installed package contracts and regenerates dependencies, navigation, routes, assets, API documentation, and the OpenAPI document. |
| `npm run voyzu:run-script -- <package-name> <script-name> [parameters...]` | Loads and runs a TypeScript function exposed by the package's `scripts` contract. |
| `npm run voyzu:build-api-reference` | Reads package API definitions and DTOs to regenerate API operation documents, DTO documents, and the combined OpenAPI document. |
| `npm run voyzu:list-packages` | Reads the installed package's `package.json` name and version for display. |
| `npm run voyzu:build` and `npm run voyzu:start` | Build and run the composed application, including the package's registered pages, APIs, and dependencies. |
| `npm run voyzu:update` | Re-composes installed packages after updating Voyzu. It does not re-run package SQL or package scripts. |
| `npm run voyzu:initialize` | Applies the install definitions of preinstalled platform packages in platform dependency order. Ordinary installable packages do not participate in initialization. |

Repository commands such as `voyzu:add-repo`, `voyzu:update-repo`, and
`voyzu:update-repos` manage source checkouts but do not install, execute, or
compose package contents. `voyzu:create-package` creates a new local package
from the reference package; it is a package-development command rather than a
lifecycle that an existing package must implement.

## Make a package installable

An installable package needs valid Voyzu metadata in `package.json` and a
default package definition in `voyzu.package.ts`. The package metadata declares
whether installation is allowed, package dependencies, and the page and API
root paths it owns.

```json
{
  "name": "@voyzu/ice-creams",
  "version": "0.1.0",
  "voyzu": {
    "voyzu-package": true,
    "allowInstall": true,
    "dependencies": [],
    "pageRootPaths": ["/ice-creams"],
    "apiRootPaths": ["/ice-creams"]
  }
}
```

The package definition registers modules and lifecycle resources:

```ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { iceCreamsModule } from "./modules/ice-creams";
import { install as installSampleData } from "./scripts/sample-data/install";

export const iceCreamsPackage = {
  modules: [iceCreamsModule],
  install: {
    sql: ["./install/db/sql/ice-cream.sql"],
    seedSql: ["./install/db/seed/ice-cream-flavor.seed.sql"],
  },
  uninstall: {
    sql: ["./uninstall/db/sql/drop-ice-cream.sql"],
  },
  scripts: {
    sampleData: installSampleData,
  },
} as const satisfies VoyzuPackageDefinition;

export default iceCreamsPackage;
```

All declared file paths are relative to the package root and must remain inside
the package directory. Runtime dependencies belong in `dependencies` or
`peerDependencies`; local development-only `file:` paths must not be published
as package dependencies.

## Installation behavior

Voyzu does not discover or execute every file beneath `install`. It executes
only the paths declared in `voyzu.package.ts`.

For `voyzu:install`, `voyzu:install-package`, `voyzu:link-package`, and
`voyzu:link-packages`, Voyzu performs the following relevant steps:

1. validates the package manifest and owned route roots;
2. copies the package into the runtime package workspace;
3. installs the composed workspace dependencies;
4. executes `install.sql` files in their declared order;
5. executes `install.seedSql` files in their declared order; and
6. composes the installed package set.

Installation SQL runs from the installed package copy. It must therefore use
only database objects and assumptions available in the target installation.
Installation and seed SQL must be idempotent because installing an updated copy
of a package runs those files again.

Installation files are executed one file at a time and are not wrapped in one
outer transaction by the package runner. A package that requires atomic work
should place the related statements in a suitable transaction within its SQL
file. Files should also be ordered so prerequisites are created before their
consumers.

`seedSql` is for reference or configuration data required by the installed
package. Optional demonstration data belongs in an ad hoc package script such
as `sampleData`.

### TypeScript installation logic

The automatic installation contract currently supports only `sql` and
`seedSql`. It does not support an install callback. Adding a function beneath
`install` fails package-definition validation.

Use SQL or PostgreSQL procedural SQL for mandatory database installation work.
Use an ad hoc package script for optional initialization, imports, sample data,
or administrative processing. A mandatory TypeScript installation step would
require a new explicit Voyzu lifecycle hook; a manually invoked script must not
be treated as if it were guaranteed to run during installation.

## Uninstallation behavior

Voyzu executes only SQL paths declared beneath `uninstall.sql`:

```ts
uninstall: {
  sql: [
    "./uninstall/db/sql/drop-ice-cream.sql",
  ],
},
```

`voyzu:uninstall-package`:

1. requires the Next.js runtime to be stopped;
2. loads the installed package definition;
3. executes all declared uninstall SQL files, in order, inside one database
   transaction;
4. rolls back the transaction and keeps the package installed if an uninstall
   file fails;
5. removes the installed package copy after successful database cleanup; and
6. recomposes the remaining packages.

Uninstall SQL may permanently delete package-owned data. It must remove objects
in dependency-safe order and must preserve platform-owned audit records.

There is currently no automatic TypeScript uninstall hook. Mandatory cleanup
must be expressed in uninstall SQL. An optional preparation or export can be an
ad hoc script that the operator runs before uninstalling, but the package must
not rely on that script having run. Supporting mandatory TypeScript uninstall
logic would require an explicit lifecycle hook that executes before the package
copy is removed and defines failure and transaction behavior.

## Ad hoc TypeScript scripts

Expose callable TypeScript functions through the `scripts` object in
`voyzu.package.ts`:

```ts
import { install as installSampleData } from "./scripts/sample-data/install";

export const iceCreamsPackage = {
  modules: [iceCreamsModule],
  scripts: {
    sampleData: installSampleData,
  },
} as const satisfies VoyzuPackageDefinition;
```

Run a declared script against the installed package copy:

```shell
npm run voyzu:run-script -- @voyzu/ice-creams sampleData
```

Additional command-line values are forwarded to the script through
`process.argv`:

```shell
npm run voyzu:run-script -- @acme/importer import ./customers.csv --replace
```

Scripts are functions, not shell command strings. They run with the Voyzu
instance environment loaded and may import package code and shared Voyzu
capabilities. Keep scripts explicit and safe to retry where practical. Validate
parameters before changing data and return a failure when the requested work is
not completed.

## Composition support

Composition expects `voyzu.package.ts` to register imported module identifiers
in its `modules` array. Each registered module must provide `pageRoutes` and
`apiDefinitions`, even when one of those collections is empty.

Depending on the package exports, composition may also consume navigation,
static assets, styles, documentation settings, and other package metadata. API
documentation generation reads API route definitions and referenced DTOs from
the package source. Generated composition and API documentation files must never be
edited directly.

Run composition after changing package contracts, dependencies, routes,
navigation, assets, API definitions, or DTO documentation:

```shell
npm run voyzu:compose
```

Restart the web server after composition so it loads the regenerated routes and
documentation. Source mirroring for a linked development package copies code
changes into the runtime, but it does not replace composition when generated
configuration must change.

## Command-support checklist

Before publishing or installing a package, confirm that:

* `package.json` has valid Voyzu metadata, version, dependencies, and owned root
  paths;
* `voyzu.package.ts` exports a valid default definition;
* every registered module satisfies the module contract;
* install and uninstall paths exist and remain inside the package;
* installation and seed SQL are idempotent;
* uninstall SQL is dependency-safe and preserves platform audit records;
* optional TypeScript operations are explicitly exposed through `scripts`;
* routes and navigation stay within the package's declared roots;
* API definitions and DTO comments are complete enough to generate the API
  Reference; and
* the composed application can typecheck and build with the package installed.

See also the [Package contract](../voyzu-platform-guide/package-contract.md),
[API patterns](api-patterns.md), and
[Managing dependencies](managing-dependencies.md).
