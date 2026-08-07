# API patterns

Voyzu exposes package APIs through one Next.js catch-all route:

```text
apps/web/app/api/[[...voyzuApiPath]]/route.ts
```

Packages do not add files beneath `apps/web/app/api`. Each module declares its
routes in `apiDefinitions`, and composition adds installed packages to the
runtime API registry.

## Define routes in `module.ts`

Each API definition must provide an HTTP method, a path, and an asynchronous
handler. Keep the handler implementation in the module's server boundary.

```ts
// packages/@acme/warehousing/modules/stock/module.ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { handleCreate, handleGet, handleList } from "./server";

export const stockModule = {
  pageRoutes: {},
  apiDefinitions: {
    list: {
      method: "GET",
      path: "/stock",
      handler: (request: any) => handleList(request),
    },
    create: {
      method: "POST",
      path: "/stock",
      handler: (request: any) => handleCreate(request),
    },
    get: {
      method: "GET",
      path: "/stock/[code]",
      handler: (request: any, context: any) =>
        handleGet(request, context),
    },
  },
} as const satisfies VoyzuPackageModuleDefinition;
```

An API-only module may use an empty `pageRoutes` object.

At runtime the route is prefixed with `/api`, so the example above exposes
`GET /api/stock`, `POST /api/stock`, and `GET /api/stock/{code}`.

## Follow REST principles

API paths must identify resources, not handler actions. Use HTTP methods to
express the operation.

| Operation | Method and module path |
|---|---|
| List stock | `GET /stock` |
| Create stock | `POST /stock` |
| Get one item | `GET /stock/[code]` |
| Replace one item | `PUT /stock/[code]` |
| Partially update one item | `PATCH /stock/[code]` |
| Delete one item | `DELETE /stock/[code]` |
| Activate one item | `PUT /stock/[code]/activation` |
| Deactivate one item | `DELETE /stock/[code]/activation` |
| Create a batch | `POST /stock-batches` |
| Search | `GET /stock-search-results?q=...` |
| Execute a structured query | `POST /stock-queries` |

Do not create action paths such as `/stock/create`, `/stock/[code]/delete`, or
`/stock/filter`. A request that does not fit ordinary CRUD should still model
the result or process as a resource.

The combination of method and path must be unique across all composed modules.
Use the package's domain vocabulary in paths to avoid collisions with other
packages.

## Use dynamic path parameters

Dynamic segments use Next.js bracket syntax in `module.ts`:

```ts
// packages/@acme/warehousing/modules/stock/module.ts
{
  method: "GET",
  path: "/stock/[code]",
  handler: (request, context) => handleGet(request, context),
}
```

The router resolves matched values through `context.params`:

```ts
// packages/@acme/warehousing/modules/stock/server/api/get.http.handlers.ts
import type { NextRequest } from "next/server";

export async function handleGet(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  // Validate code, call the service, and return a NextResponse.
}
```

Validate all path and query-string values before passing them to a service.

## Keep handlers thin

HTTP handlers must:

1. parse path, query-string, cookie, and body input;
2. validate the request contract;
3. call a server service;
4. translate the result into a response DTO; and
5. map known errors to appropriate HTTP status codes.

Handlers must not contain persistence queries or duplicate business rules.
Services own business operations and repositories own SQL.

Use conventional response statuses:

* `200` for a successful read or update with a response body.
* `201` for a successful create.
* `204` for a successful operation with no response body.
* `400` for malformed input.
* `401` for an unauthenticated request.
* `403` for an authenticated caller without sufficient access.
* `404` when the requested resource does not exist.
* `409` for a uniqueness or state conflict.
* `422` for a valid request blocked by a business rule.
* `500` for an unexpected server failure.

Use the shared Voyzu error classes and error-response DTOs where they apply.
Do not expose raw database errors or stack traces.

## Keep DTOs at the package boundary

Request and response DTOs belong to the package that owns the API. Export DTOs
that other packages are allowed to consume through an explicit `package.json`
export. Use `@voyzu/types` for framework-wide contracts such as filtering,
standard errors, auditing, and package definitions.

Do not use database row types as API DTOs. Map rows to explicit response
objects so that internal schema changes do not silently change the public API.

## Compose installed packages

Package installation and linking run composition. The composer reads each
active package's `voyzu.package.ts`, collects `apiDefinitions` from its modules,
and writes the generated API registry consumed by `voyzu.api.config.ts`.

Generated registry files must not be edited. Restart the web server after a
package is installed, linked, removed, or recomposed.
