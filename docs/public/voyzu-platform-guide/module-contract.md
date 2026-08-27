# Module contract

A module is a cohesive application capability owned by one Voyzu package. It keeps its page and API contracts separate from its implementation and exposes a stable operations surface for tests and module-to-module communication.

A module resides beneath the owning package's `modules/` directory:

```text
packages/@acme/warehousing/
└─ modules/
   └─ stock/
      ├─ client/
      ├─ domain/
      ├─ server/
      ├─ types/
      ├─ api.routes.ts
      ├─ module.ts
      ├─ operations.ts
      └─ pages.routes.ts
```

Only the folders and root files required by the module need to be present. A server-only module, for example, may have empty route collections and no `client/` folder.

## Root files

### `module.ts`

`module.ts` is the module manifest. It composes the contracts declared by the module's sibling files and contains no route definitions or implementation logic itself.

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

export default stockModule;
```

Voyzu does not discover modules by scanning the directory. The package must register the module in its root `voyzu.package.ts`:

```ts
import { stockModule } from "./modules/stock/module";

export default {
  modules: [stockModule],
};
```

Do not add a module-level `index.ts` barrel. Import the manifest, operations, or explicitly exported server entry point directly.

The module registration above belongs to the package lifecycle contract. The
application composer does not import this manifest to discover pages, APIs, or
operations. Export each lightweight sibling surface directly from
`package.json` as `./<module>/pages.routes`, `./<module>/api.routes`, and
`./<module>/operations`.

### `pages.routes.ts`

`pages.routes.ts` is the authoritative collection of the module's browser pages. Voyzu adds it to the surface registry used by the platform wildcard page to match paths and compose authorization, metadata, help, and navigation references.

```ts
export const pageRoutes = {
  list: {
    id: "acme.warehousing.stock.page.list",
    path: "/warehousing/stock",
    pageTitle: "Stock",
    loadPage: () => import("./server/pages/StockListPage")
      .then((module) => module.StockListPage),
    helpPath: "stock/overview",
    auth: { required: true, minRole: "STANDARD" },
  },
  detail: {
    id: "acme.warehousing.stock.page.detail",
    path: "/warehousing/stock/[code]",
    pageTitle: "Stock item",
    loadPage: () => import("./server/pages/StockDetailPage")
      .then((module) => module.StockDetailPage),
    breadcrumbBase: [
      { label: "Stock", href: "/warehousing/stock" },
    ],
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

Every page route requires a stable, application-wide `id`, a path within a page
root owned by the package, a title, and a lazy `loadPage` function. The route
manifest must not statically import its page component or a server barrel. The
page module and its server dependencies enter the runtime graph only after the
route is selected. Dynamic segments use Next.js bracket syntax such as
`[code]`, `[...path]`, and `[[...path]]`; Next.js extracts those parameters
before Voyzu supplies them to the page.

Expose the manifest as `./<module>/pages.routes`; composition imports this
lightweight surface directly.

Use an empty object when the module has no pages:

```ts
export const pageRoutes = {} as const;
```

Navigation belongs in the package's `navigation/` folder and refers to `pageRoutes` entries by route ID. A `helpPath` is relative to the package's `voyzu.settings.helpBaseUrl`. See [Application surfaces](../voyzu-platform-patterns/app-surface.md) and [Documentation and help](../voyzu-platform-patterns/documentation-and-help.md).

### `api.routes.ts`

`api.routes.ts` is the authoritative collection of the module's HTTP endpoints. Each entry declares the route, lazy handler loader, documentation, request schemas, and response schemas in one place.

```ts
import {
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
} from "@voyzu/types/errors";
import {
  StockItemCreateRequestDto,
  StockItemResponseDto,
} from "@acme/warehousing/types";

export const apiDefinitions = {
  create: {
    method: "POST",
    path: "/warehousing/stock",
    loadHandler: () => import("./server/api/stock.http.handlers")
      .then((module) => module.handleCreate),
    request: {
      contentType: "application/json",
      body: StockItemCreateRequestDto,
    },
    summary: "Create stock item",
    description: "Creates a stock item.",
    tags: ["Stock"],
    responses: {
      "201": {
        description: "The created stock item.",
        body: StockItemResponseDto,
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

Expose the manifest as `./<module>/api.routes`; composition and documentation
generation import this lightweight surface directly.

The combination of HTTP method and path must be unique across the composed application. Paths are relative to Voyzu's shared `/api` prefix and must remain within an API root owned by the package. For example, the declared path `/warehousing/stock` is served at `/api/warehousing/stock`.

Request and response contracts use TypeBox DTOs. The router validates requests and responses against these schemas at the HTTP perimeter. When `request.body` is declared, the body is required. JSON is the default content type when none is declared; non-JSON bodies such as PDF or CSV must declare their content type explicitly.

An invalid response indicates an application defect. In development, response validation failures throw. In production, Voyzu logs the validation error and returns the response.

Path parameters use the same Next.js bracket names as the path. Query and path schemas belong under `request`. Use an empty object when the module has no API:

```ts
export const apiDefinitions = {} as const;
```

API paths identify resources with nouns and use standard HTTP method and status semantics. See [API patterns](../voyzu-platform-patterns/api-patterns.md) and [Validation layers](../voyzu-platform-patterns/validation-layers.md).

### `operations.ts`

`operations.ts` is the module's stable, server-only command surface. It declares
TypeBox contracts and lazy typed loaders. It adds boundary validation, but no
business rules, persistence, or HTTP behaviour, and it must not eagerly import
the service module.

```ts
import "server-only";

import { operation } from "@voyzu/capability/operations";
import Type from "typebox";

export const createStockItem = operation.defineLazy(
  {
    parameters: Type.Tuple([StockItemCreateRequestDto]),
    result: StockItemResponseDto,
  },
  () => import("./server/lib/stock.service")
    .then((module) => module.createStockItem),
);

export const operations = {
  createStockItem,
} as const;
```

Operations are called by package-level operation tests and may be called by other modules. Code already inside the owning module calls its service methods directly. HTTP handlers also call services directly rather than routing through operations.

Cross-package callers use the composed operation registry rather than importing
the providing package. See [Operation patterns](../voyzu-platform-patterns/operations.md).

Expose operations intended for external use through the package's `package.json`:

```jsonc
{
  "exports": {
    "./stock/operations": "./modules/stock/operations.ts"
  }
}
```

## `client/`

`client/` contains browser-safe React components, hooks, and utilities. Client components may call HTTP APIs but must not import database access, credentials, services, or anything beneath `server/`.

```text
client/
├─ pages/
│  └─ StockListContent.tsx
└─ index.ts
```

```tsx
// client/pages/StockListContent.tsx
"use client";

export function StockListContent({ items }: StockListContentProps) {
  return <StockTable items={items} />;
}
```

`client/index.ts` is a controlled client-safe barrel:

```ts
export { StockListContent } from "./pages/StockListContent";
```

## `domain/`

`domain/` is optional and contains pure business policies that do not depend on React, HTTP, Next.js, or persistence. It is useful when the same rule drives both server enforcement and UI availability.

```text
domain/
└─ operation-policy.ts
```

```ts
export function changeCodeBlockers(
  item: { hasTransactions: boolean },
): string[] {
  return item.hasTransactions
    ? ["The code cannot be changed after transactions exist."]
    : [];
}
```

Server services remain the authority and must enforce the rule even when the client uses the same policy to disable an action.

## `types/`

`types/` is optional for module-private schemas and types. Public DTOs shared by API definitions, operations, or other packages normally belong in the owning package's top-level `types/` folder and are exported through `package.json`.

```ts
// types/stock-selection.dto.ts
import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const StockSelectionDto = StrictObject({
  code: Type.String(),
});

export type StockSelectionDto = Type.Static<typeof StockSelectionDto>;
```

DTO schemas own structural object validation. Do not repeat their length, shape, required-field, or primitive-type constraints in service validators.

## `server/`

`server/` contains all server-only implementation code. Browser code must never import this folder. Keep API transport, persistence, services, and server-rendered pages in their dedicated subfolders.

```text
server/
├─ api/
├─ db/
├─ lib/
├─ pages/
└─ index.ts
```

### `server/index.ts`

`server/index.ts` is an optional controlled server entry point for deliberate
public server APIs. Route registration and composition do not use it; page and
API loaders dynamically import their specific implementation modules.

```ts
export { StockListPage } from "./pages/StockListPage";
export { StockDetailPage } from "./pages/StockDetailPage";
```

Expose this entry point explicitly through the owning package's `package.json`
only when another deliberate consumer needs it. Programmatic consumers normally
use `operations.ts`; they must not import private service or server file paths.

```jsonc
{
  "exports": {
    "./modules/stock/server": "./modules/stock/server/index.ts"
  }
}
```

### `server/api/`

`server/api/` contains thin HTTP handlers. A handler reads HTTP-specific input, calls a service, maps known errors to Voyzu responses, and returns a `NextResponse`.

```ts
// server/api/stock.http.handlers.ts
export async function handleCreate(req: NextRequest): Promise<NextResponse> {
  try {
    const input = await parseBody<StockItemCreateRequestDto>(req);
    return created(await createStockItem(input));
  } catch (error) {
    if (error instanceof BusinessRuleError) return businessRuleError(error);
    return serverError(error);
  }
}
```

TypeBox validation belongs to the API route and is performed by the router. Handlers do not repeat DTO validation.

### `server/db/`

`server/db/` owns repositories, SQL, and persistence row types. Repositories accept a database executor so services can use the same transaction across repositories and cross-package commands.

```text
server/db/
├─ stock.repo.ts
└─ stock.row.types.ts
```

```ts
export class StockRepo {
  constructor(private readonly db: DbExecutor) {}

  async findByCode(code: string): Promise<StockRow | null> {
    const result = await this.db.query(
      "SELECT * FROM stock_item WHERE code = $1",
      [code],
    );
    return result.rows[0] ?? null;
  }
}
```

Pages and HTTP handlers must not issue ad hoc persistence queries for module-owned data; they call services or repositories through the appropriate server layer.

### `server/lib/`

`server/lib/` contains services, mappers, and business validators. Services orchestrate transactions, persistence, auditing, business rules, DTO mapping, and command calls.

```text
server/lib/
├─ stock.mapper.ts
├─ stock.service.ts
└─ stock.validator.ts
```

```ts
export async function deleteStockItem(
  code: string,
): Promise<StockItemResponseDto> {
  return withTransaction(async (db) => {
    const repo = new StockRepo(db);
    const deleted = await repo.delete(code);
    return toResponseDto(deleted);
  });
}
```

Validators in `server/lib/` contain business validation only:

```ts
export function validateDeletion(item: StockItem): void {
  if (item.hasTransactions) {
    throw new BusinessRuleError(
      "A stock item with transactions cannot be deleted.",
    );
  }
}
```

Mutations of auditable data create and persist Voyzu audit stamps within the same business operation. See [Data](../voyzu-platform-patterns/data.md), [Auditing](../voyzu-platform-patterns/auditing-patterns.md), and [Validation layers](../voyzu-platform-patterns/validation-layers.md).

### `server/pages/`

`server/pages/` contains server-rendered React page components referenced by `pages.routes.ts`. They load initial data and compose client components but do not own business rules.

```tsx
// server/pages/StockListPage.tsx
import "server-only";

import { StockListContent } from "../../client";
import { listStockItems } from "../lib/stock.service";

export async function StockListPage() {
  const items = await listStockItems();
  return <StockListContent items={items} />;
}
```

Keep server-rendered pages out of client-safe barrels. A Node-safe service entry point must not accidentally expose Next.js page dependencies to scripts or tests that do not run inside Next.js.

## Package-level tests

Module operation tests live in the owning package's top-level `tests/operations/[module-name]/` folder rather than inside the module.

```text
packages/@acme/warehousing/
└─ tests/
   └─ operations/
      └─ stock/
         └─ stock.operations.test.ts
```

```ts
import { operations } from "../../../modules/stock/operations";

it("creates a stock item", async () => {
  const item = await operations.createStockItem(input);
  expect(item.code).toBe(input.code);
});
```

Test every exported operation. Tests should clean up the records they create; intentional audit records may remain. See [Testing](../voyzu-platform-patterns/tests.md).

## Reference module

The Ice Creams module demonstrates this contract in a complete package.

[View the Ice Creams module on GitHub](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams/modules/ice-creams).
