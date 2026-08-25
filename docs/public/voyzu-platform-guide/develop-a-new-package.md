# Develop a new package

Voyzu business functionality is delivered through packages. A package owns its
identity, lifecycle resources, public contracts, and one or more modules. Each
module represents a coherent capability with its own pages, APIs, operations,
events, UI, services, and persistence.

This guide uses the
[`@voyzu/ice-creams` reference package](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams)
as a practical example. Before starting, create a development workspace by
following [Development setup](development-setup.md).

## Scaffold the package

From the development workspace root, run:

```shell
npm run voyzu:create-package @acme/customer-orders
```

The command creates `packages/@acme/customer-orders` from the reference package,
rewrites its package identity and derived names, and links it into the
development runtime. Use a scoped npm name in the form
`@publisher/package-name`. The workspace must already contain a root `packages`
directory and an initialized Voyzu database.

The package name and source directory must match exactly:

```text
package.json name:  @acme/customer-orders
source directory:   packages/@acme/customer-orders/
```

The scaffold is a working reference, not a requirement to retain every sample
module. Remove capabilities that the new package does not need and rename the
remaining domain concepts deliberately.

## Understand the package structure

A complete package can contain:

```text
packages/@acme/customer-orders/
├─ docs/
│  └─ public/
├─ install/
│  ├─ db/
│  │  ├─ seed/
│  │  └─ sql/
│  └─ manifest.ts
├─ modules/
│  └─ orders/
├─ navigation/
├─ public-assets/
├─ scripts/
├─ tests/
│  └─ operations/
│     └─ orders/
├─ types/
├─ uninstall/
│  ├─ db/
│  │  └─ sql/
│  └─ manifest.ts
├─ listeners.ts
├─ package.json
├─ README.md
└─ voyzu.package.ts
```

Only add optional folders when the package needs them. The package must follow
the [Package contract](package-contract.md), and every registered module must
follow the [Module contract](module-contract.md).

## Define `package.json`

`package.json` identifies the package, declares its route ownership and
dependencies, and exposes its public entry points.

```json
{
  "name": "@acme/customer-orders",
  "version": "0.1.0",
  "description": "Customer order management for Voyzu.",
  "private": true,
  "type": "module",
  "voyzu": {
    "voyzu-package": true,
    "allowInstall": true,
    "dependencies": [],
    "pageRootPaths": ["/customer-orders"],
    "apiRootPaths": ["/customer-orders"],
    "settings": {
      "helpBaseUrl": "https://docs.example.com/"
    }
  },
  "exports": {
    "./voyzu-package": {
      "types": "./voyzu.package.ts",
      "import": "./voyzu.package.ts"
    },
    "./modules/orders/operations": {
      "types": "./modules/orders/operations.ts",
      "import": "./modules/orders/operations.ts"
    },
    "./types": {
      "types": "./types/index.ts",
      "import": "./types/index.ts"
    }
  },
  "peerDependencies": {
    "@voyzu/capability": "^0.1.0",
    "@voyzu/types": "^0.1.0",
    "@voyzu/ui-components": "^0.1.0",
    "@voyzu/ui-layout": "^0.1.0",
    "@voyzu/ui-style": "^0.1.0",
    "@voyzu/ui-surface": "^0.1.0",
    "next": "^16",
    "react": "^19",
    "server-only": "^0.0.1",
    "typebox": "^1.3.0"
  }
}
```

Declare host-provided libraries as `peerDependencies`. Put only
package-specific runtime libraries in `dependencies`. The Voyzu platform is
implicit; list another installable Voyzu package in `voyzu.dependencies` only
when installation order genuinely depends on it.

## Define public DTOs with TypeBox

DTOs are runtime schemas as well as TypeScript contracts. Put shared public DTOs
in the package's top-level `types/` folder and export them through
`package.json`.

```ts
// types/order.dto.ts
import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const OrderCreateRequestDto = StrictObject({
  code: Type.String({ pattern: "^[A-Z0-9][A-Z0-9_-]*$", maxLength: 30 }),
  customerCode: Type.String({ minLength: 1, maxLength: 30 }),
});

export type OrderCreateRequestDto = Type.Static<typeof OrderCreateRequestDto>;

export const OrderResponseDto = StrictObject({
  id: Type.Integer({ minimum: 1 }),
  code: Type.String(),
  customerCode: Type.String(),
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
});

export type OrderResponseDto = Type.Static<typeof OrderResponseDto>;
```

The Voyzu API router validates declared request and response schemas at the HTTP
perimeter. Keep validators under `server/lib` for business rules, such as
whether an order can be cancelled; do not repeat DTO shape validation there.

See [Validation layers](../voyzu-platform-patterns/validation-layers.md).

## Add installation and removal resources

Packages that own database objects place ordered SQL under `install/db/sql` and
optional seed data under `install/db/seed`. SQL should be rerunnable and should
use database constraints to protect structural integrity.

```text
install/
├─ db/
│  ├─ sql/
│  │  └─ customer-order.sql
│  └─ seed/
│     └─ order-status.seed.sql
└─ manifest.ts
```

```ts
// install/manifest.ts
export const install = {
  sql: ["./install/db/sql/customer-order.sql"],
  seedSql: ["./install/db/seed/order-status.seed.sql"],
} as const;
```

If the package supports removal, add dependency-safe SQL beneath `uninstall/`
and declare it in an uninstall manifest. Uninstall normally reverses creation
order and must preserve platform audit history.

```ts
// uninstall/manifest.ts
export const uninstall = {
  sql: ["./uninstall/db/sql/drop-customer-order.sql"],
} as const;
```

## Build a module

The Orders module keeps its public contracts at the module root and its
implementation in dedicated folders:

```text
modules/orders/
├─ client/                  # Browser-safe React components
├─ domain/                  # Optional pure business policies
├─ server/
│  ├─ api/                  # Thin HTTP handlers
│  ├─ db/                   # Repositories and persistence row types
│  ├─ lib/                  # Services, mappers, and business validators
│  ├─ pages/                # Server-rendered page components
│  └─ index.ts              # Controlled server entry point
├─ types/                   # Optional module-private schemas
├─ api.routes.ts
├─ events.ts
├─ module.ts
├─ operations.ts
└─ pages.routes.ts
```

Do not add a module-root `index.ts` barrel. Import the module manifest from
`module.ts` and expose only deliberate public entry points through the package's
`exports` map.

### Compose the module

`module.ts` only composes the sibling contracts:

```ts
// modules/orders/module.ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { events } from "./events";
import { operations } from "./operations";
import { pageRoutes } from "./pages.routes";

export const ordersModule = {
  pageRoutes,
  apiDefinitions,
  operations,
  events,
} as const satisfies VoyzuPackageModuleDefinition;

export default ordersModule;
```

Use empty objects for `pageRoutes` or `apiDefinitions` when the module does not
provide that kind of route. Omit `events` only when the module exposes no
state-changing operations.

### Register page routes

`pages.routes.ts` is the authoritative page registry:

```tsx
// modules/orders/pages.routes.ts
import { OrderDetailPage, OrdersListPage } from "./server";

export const pageRoutes = {
  list: {
    id: "acme.customer-orders.orders.page.list",
    path: "/customer-orders",
    Page: OrdersListPage,
    pageTitle: "Customer Orders",
    helpPath: "customer-orders/orders",
    breadcrumbBase: [],
    auth: { required: true, minRole: "STANDARD" },
  },
  detail: {
    id: "acme.customer-orders.orders.page.detail",
    path: "/customer-orders/[code]",
    Page: OrderDetailPage,
    pageTitle: "Customer Order",
    helpPath: "customer-orders/orders",
    breadcrumbBase: [
      { label: "Customer Orders", href: "/customer-orders" },
    ],
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

Route IDs must be stable and globally unique. Page paths must remain within a
root declared by `voyzu.pageRootPaths`.

### Register API routes

`api.routes.ts` declares transport, documentation, request schemas, response
schemas, and thin handlers together:

```ts
// modules/orders/api.routes.ts
import {
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
} from "@voyzu/types/errors";
import Type from "typebox";

import { OrderCreateRequestDto, OrderResponseDto } from "../../types";
import { handleCreate, handleList } from "./server/api/order.http.handlers";

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/customer-orders",
    handler: handleList,
    summary: "List customer orders",
    description: "Lists customer orders.",
    tags: ["Customer Orders"],
    responses: {
      "200": {
        description: "Customer orders.",
        body: Type.Array(OrderResponseDto),
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
  create: {
    method: "POST",
    path: "/customer-orders",
    handler: handleCreate,
    request: {
      contentType: "application/json",
      body: OrderCreateRequestDto,
    },
    summary: "Create a customer order",
    description: "Creates a customer order.",
    tags: ["Customer Orders"],
    responses: {
      "201": {
        description: "The created customer order.",
        body: OrderResponseDto,
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
    },
  },
} as const;
```

API paths are relative to Voyzu's `/api` base and must remain within a root
declared by `voyzu.apiRootPaths`. JSON is the default content type when one is
not declared. Declare non-JSON content such as `application/pdf` or `text/csv`
explicitly. A declared request body retains the current required-body behavior.
Declare every expected success and error response, including the standard
authentication, authorization, and server-error responses.

HTTP handlers call services directly. They normalize validated transport values,
map known errors, and return responses; they do not own persistence or business
rules.

### Implement services and operations

Services under `server/lib` own business orchestration and transactions. They
call repositories, apply business validation, map persistence rows to DTOs, and
dispatch events.

`operations.ts` is a thin, server-only programmatic facade over those services.
It adds no validation or business behavior:

```ts
// modules/orders/operations.ts
import "server-only";

import * as service from "./server/lib/order.service";

export const createOrder = (...args: Parameters<typeof service.createOrder>) =>
  service.createOrder(...args);

export const listOrders = (...args: Parameters<typeof service.listOrders>) =>
  service.listOrders(...args);

export const deleteOrder = (...args: Parameters<typeof service.deleteOrder>) =>
  service.deleteOrder(...args);

export const operations = {
  createOrder,
  deleteOrder,
  listOrders,
} as const;
```

Use operations for tests and deliberate programmatic access. HTTP handlers
continue to call services directly.

### Declare events

Each state-changing public operation should have a corresponding completed-action
event whose payload matches the successful operation response:

```ts
// modules/orders/events.ts
import { OrderResponseDto } from "../../types";

export const events = {
  orderCreated: {
    description: "A customer order was created.",
    payload: OrderResponseDto,
  },
} as const;
```

The service dispatches its local event definition. Other packages consume the
derived global event name through package-level listeners. Functions within the
same package should call services directly. See
[Event patterns](../voyzu-platform-patterns/events.md).

## Register the package manifest

`voyzu.package.ts` explicitly composes the package. Voyzu does not discover
modules or lifecycle files by scanning directories.

```ts
// voyzu.package.ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { ordersModule } from "./modules/orders/module";
import { uninstall } from "./uninstall/manifest";

export const customerOrdersPackage = {
  modules: [ordersModule],
  install,
  uninstall,
} as const satisfies VoyzuPackageDefinition;

export default customerOrdersPackage;
```

Every package registers at least one module. Installation, removal, scripts,
and listeners are optional.

## Add navigation

Navigation is optional. It references page route IDs instead of repeating URL
paths:

```ts
// navigation/top-nav.ts
import { ordersModule } from "../modules/orders/module";

export default {
  label: "Customer Orders",
  routeId: ordersModule.pageRoutes.list.id,
} as const;
```

```ts
// navigation/left-nav.ts
import { ordersModule } from "../modules/orders/module";

export default [
  {
    items: [
      {
        label: "Orders",
        icon: "receipt_long",
        routeId: ordersModule.pageRoutes.list.id,
      },
    ],
  },
] as const;
```

Expose each contributed navigation file through `package.json` using
`./navigation/top-nav` and `./navigation/left-nav` exports.

## Add tests

Tests live at package level and mirror the module operations surface:

```text
tests/
└─ operations/
   └─ orders/
      └─ orders.operations.test.ts
```

```ts
import { describe, expect, it } from "vitest";
import {
  createOrder,
  deleteOrder,
} from "@acme/customer-orders/modules/orders/operations";

describe("orders operations", () => {
  it("creates an order", async () => {
    const code = `ORDER_${Date.now()}`;
    try {
      const order = await createOrder({
        code,
        customerCode: "CUSTOMER_001",
      });

      expect(order.code).toBe(code);
    } finally {
      await deleteOrder(code).catch(() => undefined);
    }
  });
});
```

All functions exposed through `operations.ts` should be tested. Use unique
fixtures and remove created business records so tests are repeatable; generated
audit history may remain. See [Testing patterns](../voyzu-platform-patterns/tests.md).

## Add assets and documentation

Place package-owned static files beneath `public-assets/`. Composition publishes
them under the full scoped package name, preventing collisions:

```text
Source: public-assets/images/order.svg
URL:    /@acme/customer-orders/images/order.svg
```

Keep the package overview in `README.md`. Put detailed documentation beneath
`docs/`, with published help content under `docs/public/`. A page route's
`helpPath` is resolved against `voyzu.settings.helpBaseUrl`.

## Link, compose, and run

`voyzu:create-package` links the scaffold automatically. For a manually created
or previously unlinked package, run:

```shell
npm run voyzu:link-package @acme/customer-orders
```

Linking creates a physical runtime copy beneath `.run/packages`, runs the
package installation, installs composed dependencies, and composes Voyzu.

Start the linked-package development runtime and watcher with:

```shell
npm run dev
```

Voyzu mirrors editable linked-package source into the transient runtime. Run
composition after changing package exports, module registration, page or API
routes, navigation, events, assets, or API schemas:

```shell
npm run voyzu:compose
```

Composition generates navigation, event, operation, and API Reference files
beneath `apps/web/.generated`. The platform wildcard page and API handlers use
these registries at runtime. Never edit generated files directly.

See [Commands](commands.md) for the complete command reference.

## Reference package

The Ice Creams package demonstrates CRUD pages, REST APIs, TypeBox DTOs,
business validation, persistence, auditing, reports, sample data, and operation
tests.

[View the Ice Creams reference package on GitHub](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams).
