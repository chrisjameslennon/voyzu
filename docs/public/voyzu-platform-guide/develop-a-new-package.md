# Develop a new package

Voyzu business functionality is delivered through packages. A package has its own identity, installation assets and public exports, and contains one or more modules. Each module owns a coherent set of page routes, API routes and supporting business functionality.

This guide uses [the `@voyzu/ice-creams` reference package](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams) as its example. Ice Creams is a self-contained CRUD package with reference data, application pages, REST APIs, a report, auditing, sample data and tests.

Before starting, create a Voyzu development environment by following [Development setup](development-setup.md).

## Create the package directory

Create the package beneath the development workspace using its npm scope and package name:

```
# Development workspace root
packages/
└─ @voyzu/
   └─ ice-creams/
```

Every Voyzu package name must have the form `@publisher/package-name`. The directory and the `name` in `package.json` must agree exactly. For example, `packages/@voyzu/ice-creams` must declare `"name": "@voyzu/ice-creams"`.

## Create the package structure

The Ice Creams package separates package-level configuration from the modules that implement its functionality:

```
# packages/@voyzu/ice-creams
├─ install/
│  └─ db/
│     ├─ seed/
│     └─ sql/
├─ docs/
│  └─ public/
│     └─ example-help.md
├─ modules/
│  ├─ audit/
│  ├─ ice-creams/
│  ├─ reports/
│  └─ types/
├─ navigation/
├─ public-assets/
├─ scripts/
├─ package.json
├─ README.md
└─ voyzu.package.ts
```

The package must conform to the [package contract](package-contract.md). Every module registered by the package must conform to the [module contract](module-contract.md).

## Define the package metadata

Create `package.json` at the package root. The `voyzu.voyzu-package` flag marks the directory as a Voyzu package, while `voyzu.allowInstall` controls whether Voyzu permits it to be installed. Runtime visibility is managed by Package Management after installation.

```json
{
  "name": "@voyzu/ice-creams",
  "version": "0.1.0",
  "description": "A best-practice, self-contained ice-cream management package.",
  "repository": "https://github.com/chrisjameslennon/voyzu-packages.git",
  "private": true,
  "type": "module",
  "voyzu": {
    "voyzu-package": true,
    "allowInstall": true,
    "dependencies": [],
    "pageRootPaths": ["/ice-creams"],
    "apiRootPaths": ["/ice-creams"],
    "settings": {
      "helpBaseUrl": "https://voyzu.gitbook.io/docs/"
    }
  },
  "exports": {
    "./voyzu-package": {
      "types": "./voyzu.package.ts",
      "import": "./voyzu.package.ts"
    }
  },
  "dependencies": {
  },
  "peerDependencies": {
    "@voyzu/audit": "^0.1.0",
    "@voyzu/capability": "^0.1.0",
    "@voyzu/types": "^0.1.0",
    "@voyzu/ui-components": "^0.1.0",
    "@voyzu/ui-layout": "^0.1.0",
    "@voyzu/ui-style": "^0.1.0",
    "@voyzu/ui-surface": "^0.1.0",
    "next": "^16",
    "react": "^19"
  }
}
```

Declare packages required at runtime in `dependencies` or `peerDependencies`.

## Add database installation

Packages that own database objects place their ordered, repeatable SQL beneath `install/db`. Ice Creams creates a reference table and a business table:

```
# packages/@voyzu/ice-creams/install/db
├─ sql/
│  ├─ ice-cream-flavor.sql
│  └─ ice-cream.sql
└─ seed/
   └─ ice-cream-flavor.seed.sql
```

The schema uses a foreign key from `ice_cream` to `ice_cream_flavor`, stable business codes, status constraints and the standard Voyzu audit columns. Database constraints protect structural integrity even when data is written outside the user interface.

```sql
-- packages/@voyzu/ice-creams/install/db/sql/ice-cream.sql
CREATE TABLE IF NOT EXISTS ice_cream (
    id                       BIGSERIAL PRIMARY KEY,
    code                     TEXT NOT NULL UNIQUE,
    name                     TEXT NOT NULL,
    flavor_id                BIGINT NOT NULL,
    supplier                 TEXT NOT NULL,
    status                   TEXT NOT NULL DEFAULT 'ACTIVE',

    creation_date            audit_timestamp,
    creation_actor_type      actor_type,
    creation_user_id         TEXT,
    creation_mutation_id     UUID,

    updated_date             audit_timestamp,
    updated_actor_type       actor_type,
    updated_user_id          TEXT,
    updated_mutation_id      UUID,

    deletion_date            audit_timestamp,
    deletion_actor_type      actor_type,
    deletion_user_id         TEXT,
    deletion_mutation_id     UUID,

    CONSTRAINT fk_ice_cream_flavor
      FOREIGN KEY (flavor_id) REFERENCES ice_cream_flavor(id),
    CONSTRAINT ck_ice_cream_code
      CHECK (code = upper(code) AND btrim(code) <> ''),
    CONSTRAINT ck_ice_cream_name
      CHECK (btrim(name) <> ''),
    CONSTRAINT ck_ice_cream_supplier
      CHECK (btrim(supplier) <> ''),
    CONSTRAINT ck_ice_cream_status
      CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX IF NOT EXISTS ix_ice_cream_flavor_id
  ON ice_cream(flavor_id);

CREATE INDEX IF NOT EXISTS ix_ice_cream_status
  ON ice_cream(status);

DROP TRIGGER IF EXISTS ice_cream_audit_trigger ON ice_cream;
CREATE TRIGGER ice_cream_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON ice_cream
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_fn('@acme/example-package');
```

Reference seeds belong under `install/db/seed`. Optional demonstration data belongs in a callable package script rather than the database seed.

## Create a module

The primary Ice Creams module owns the CRUD interface and APIs:

```
# packages/@voyzu/ice-creams/modules/ice-creams
├─ client/             # Interactive React components
├─ domain/             # Pure business policies
├─ server/
│  ├─ api/             # HTTP handlers
│  ├─ db/              # Repositories and persisted row types
│  ├─ lib/             # Services, mapping and validation
│  └─ pages/           # Server-rendered page components
├─ tests/
├─ index.ts
└─ module.ts
```

The module's `module.ts` is the authoritative registry of its application pages and REST endpoints. This abbreviated excerpt shows one API route:

```ts
// packages/@voyzu/ice-creams/modules/ice-creams/module.ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

export const iceCreamsModule = {
  pageRoutes: {
    list: {
      id: "voyzu.ice-creams.page.list",
      path: "/ice-creams",
      Page: IceCreamsListPage,
      pageTitle: "Ice Creams",
      helpPath: "/extending-voyzu/develop-a-new-package",
      auth: { required: true, minRole: "ORGANIZATION_USER" },
    },
    detail: {
      id: "voyzu.ice-creams.page.detail",
      path: "/ice-creams/[code]",
      Page: IceCreamDetailPage,
      pageTitle: "Ice Cream",
      helpPath: "/extending-voyzu/develop-a-new-package",
      auth: { required: true, minRole: "ORGANIZATION_USER" },
    },
  },
  apiDefinitions: {
    list: {
      method: "GET",
      path: "/ice-creams",
      handler: (request: any) => handleList(request),
      apiDoc: {
        summary: "List",
        description: "Lists all ice creams.",
        tags: ["Ice Creams"],
        responses: {
          "200": {
            description: "All ice creams.",
            schema: arrayOf(dtoRef("IceCreamResponseDto")),
          },
        },
      },
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;
```

Page paths are relative to the application root. API paths are relative to Voyzu's `/api` base path and must follow REST principles. Route IDs must be stable and unique across the composed Voyzu instance.

## Implement the module layers

The Ice Creams module follows the standard Voyzu implementation layers:

| Location       | Responsibility                                      |
| -------------- | --------------------------------------------------- |
| `client`       | Forms, lists, details and client-side interaction   |
| `domain`       | Pure operation policies shared by client and server |
| `server/api`   | HTTP input extraction and response mapping          |
| `server/db`    | SQL access and persisted row mapping                |
| `server/lib`   | Validation, business rules and orchestration        |
| `server/pages` | Server-side page data loading                       |
| `tests`        | Domain, service, validation and integration tests   |

Business rules must be enforced in the server service layer. Client-side use of the same policy may improve feedback, but it must not replace server-side enforcement.

```ts
// packages/@voyzu/ice-creams/modules/ice-creams/domain/operation-policy.ts
export function Activate(
  current: IceCreamOperationState,
): OperationBlocker[] {
  return current.status === "ACTIVE"
    ? [{
        code: "ALREADY_ACTIVE",
        message: `Ice cream ${current.code} is already active`,
      }]
    : [];
}
```

For more information see [validation-layers.md](../voyzu-platform-patterns/validation-layers.md "mention")

## Register the modules

A package may contain multiple modules. Ice Creams registers its CRUD, report and audit modules in `voyzu.package.ts`. This file is authoritative; Voyzu does not discover modules by scanning the `modules` directory.

```ts
// packages/@voyzu/ice-creams/voyzu.package.ts
export const iceCreamsPackage = {
  modules: [
    iceCreamsModule,
    iceCreamReportsModule,
    iceCreamAuditModule,
  ],
  install: {
    sql: [
      "./install/db/sql/ice-cream-flavor.sql",
      "./install/db/sql/ice-cream.sql",
    ],
    seedSql: [
      "./install/db/seed/ice-cream-flavor.seed.sql",
    ],
  },
  uninstall: {
    sql: [
      "./uninstall/db/sql/drop-ice-cream.sql",
      "./uninstall/db/sql/drop-ice-cream-flavor.sql",
    ],
  },
  scripts: {
    sampleData: installSampleData,
  },
} as const satisfies VoyzuPackageDefinition;
```

Every package must register at least one module. The `install`, `uninstall`, and `scripts` sections are optional.

## Add navigation

Navigation is optional. A package with user-interface pages may export a top navigation item, a left navigation definition, both, or neither. Navigation refers to page route IDs rather than duplicating URL paths.

```ts
// packages/@voyzu/ice-creams/navigation/top-nav.topnav.ts
export const iceCreamsTopNav = {
  label: "Ice Creams",
  routeId: iceCreamsModule.pageRoutes.list.id,
} as const;

export default iceCreamsTopNav;
```

```ts
// packages/@voyzu/ice-creams/navigation/left-nav.leftnav.ts
export const iceCreamsLeftNav = [
  {
    items: [
      {
        label: "Ice Creams",
        icon: "icecream",
        routeId: iceCreamsModule.pageRoutes.list.id,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        label: "All Ice Creams",
        icon: "summarize",
        routeId: iceCreamReportsModule.pageRoutes.all.id,
      },
    ],
  },
  {
    label: "Audit",
    items: [
      {
        label: "Audit Log",
        icon: "history",
        routeId: iceCreamAuditModule.pageRoutes.list.id,
      },
    ],
  },
] as const;

export default iceCreamsLeftNav;
```

Expose each navigation definition that the package provides through `package.json`:

```json
{
  "exports": {
    "./navigation/top-nav": {
      "types": "./navigation/top-nav.topnav.ts",
      "import": "./navigation/top-nav.topnav.ts"
    },
    "./navigation/left-nav": {
      "types": "./navigation/left-nav.leftnav.ts",
      "import": "./navigation/left-nav.leftnav.ts"
    }
  }
}
```

## Expose public functionality

Use the `exports` map in `package.json` to define the only entry points that other packages may import. Consumers must not reach into private source files.

```json
{
  "exports": {
    "./modules/ice-creams/server": {
      "types": "./modules/ice-creams/server/index.ts",
      "import": "./modules/ice-creams/server/index.ts"
    },
    "./types": {
      "types": "./modules/types/index.ts",
      "import": "./modules/types/index.ts"
    }
  }
}
```

A consuming package can then use the public package name:

```ts
// packages/@acme/menus/modules/menu/server/lib/menu.service.ts
import { getIceCream } from "@voyzu/ice-creams/modules/ice-creams/server";
import type { IceCreamResponseDto } from "@voyzu/ice-creams/types";
```

## Add public assets

Place package-owned static files in an optional package-root `public-assets` directory. Composition publishes them beneath the full package name in the Next.js public directory. For example, `@acme/warehousing/public-assets/logo.svg` is served at `/@acme/warehousing/logo.svg`.

Packages must use their own scoped public path and must not write directly to the platform's `apps/web/public` directory. Composition replaces published assets on update and removes them on uninstall.

## Link and compose the package

Link the local package into the development runtime:

```shell
npm run voyzu:link-package -- @voyzu/ice-creams
```

The command installs a physical package copy beneath `.run/packages`, applies its database installation, installs workspace dependencies and composes its modules into Voyzu. The command name is retained for compatibility.

Start the development server:

```shell
npm run voyzu:dev
```

While development is running, Voyzu watches the editable source beneath `packages` and mirrors additions, changes, renames and deletions into the runtime copy for hot reload. Run composition again after changing package exports, module registrations, routes or navigation:

```shell
npm run voyzu:compose
```

## Add tests and documentation

Test domain rules, validation, services, repositories, handlers and critical page behaviour at the narrowest useful boundary. Keep tests with the module they exercise.

Keep the package overview in its root `README.md`. Place all other package documentation under the package-root `docs` directory. Public-facing documentation and online-help source belong under `docs/public`.

Page routes may define a `helpPath` that Voyzu resolves against the package's `voyzu.settings.helpBaseUrl` setting.

Documentation may be published through GitBook or another provider. See [Documentation and help](../voyzu-platform-patterns/documentation-and-help.md) for the complete pattern.

## Reference package

The complete Ice Creams implementation conforms to the package and module contracts and demonstrates the patterns described in this guide.

[View the Ice Creams reference package on GitHub](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams)
