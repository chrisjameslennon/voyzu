# API patterns

Voyzu composes package API definitions into a registry consumed by the platform wildcard API handler:

```text
apps/web/app/api/[[...voyzuApiPath]]/route.ts
```

Packages do not maintain Next.js route files. Each module declares its routes
in `apiDefinitions`; composition adds the package modules to the shared registry,
and the wildcard handler matches the request path and HTTP method.

## Define routes in `api.routes.ts`

Each API definition must provide an HTTP method, a path, and an asynchronous
handler. Keep the handler implementation in the module's server boundary.

```ts
// packages/@acme/warehousing/modules/stock/api.routes.ts
import { handleCreate, handleGet, handleList } from "./server/api/stock.http.handlers";

export const apiDefinitions = {
  list: {
    method: "GET",
    path: "/warehousing/stock",
    handler: handleList,
  },
  create: {
    method: "POST",
    path: "/warehousing/stock",
    handler: handleCreate,
  },
  get: {
    method: "GET",
    path: "/warehousing/stock/[code]",
    handler: handleGet,
  },
} as const;
```

An API-only module may use an empty `pageRoutes` object.

At runtime the route is prefixed with `/api`, so the example above exposes
`GET /api/warehousing/stock`, `POST /api/warehousing/stock`, and
`GET /api/warehousing/stock/{code}`.
Next.js performs path matching, parameter extraction and method dispatch. The
thin Voyzu handler retains authentication plus request and response validation.

## Implement the standard API methods

Unless a module has a particular reason to expose a different contract, it
should implement the following 17 API methods. Using this standard gives Voyzu
modules predictable CRUD, search, batch, and lifecycle operations.

| Operation | Method and module path |
|---|---|
| List ice creams | `GET /ice-creams` |
| Create an ice cream | `POST /ice-creams` |
| Filter ice creams | `POST /ice-creams/filter` |
| Search ice creams | `GET /ice-creams/search?q=...` |
| Batch create ice creams | `POST /ice-creams/batch/create` |
| Batch get ice creams | `POST /ice-creams/batch/get` |
| Batch update ice creams | `PUT /ice-creams/batch/update` |
| Batch patch ice creams | `PATCH /ice-creams/batch/patch` |
| Batch delete ice creams | `POST /ice-creams/batch/delete` |
| Batch activate ice creams | `POST /ice-creams/batch/activate` |
| Batch deactivate ice creams | `POST /ice-creams/batch/deactivate` |
| Activate an ice cream | `POST /ice-creams/[code]/activate` |
| Deactivate an ice cream | `POST /ice-creams/[code]/deactivate` |
| Get an ice cream | `GET /ice-creams/[code]` |
| Update an ice cream | `PUT /ice-creams/[code]` |
| Patch an ice cream | `PATCH /ice-creams/[code]` |
| Delete an ice cream | `DELETE /ice-creams/[code]` |

The activate, deactivate, and batch command paths are intentional parts of the
Voyzu API convention. Do not invent alternative names or HTTP methods for
these standard operations. A module should omit an operation when its domain
rules make that operation inappropriate. For example, the Voyzu Audit module
is read-only: audit events are immutable records and cannot be created,
updated, activated, deactivated, or deleted through the Audit API. It therefore
exposes only the read operations that make sense for audit events rather than
implementing all 17 methods. Document the reason for any such deviation in the
module.

The combination of method and path must be unique across all composed modules.
Use the package's domain vocabulary in paths to avoid collisions with other
packages.

## Document every API operation

Every API definition is the source for routing, runtime request and response
validation, the Voyzu API Reference, and the combined OpenAPI document. Document the operation's
purpose, every input, its successful response, and every error response callers
can receive.

The following Ice Creams example is deliberately exhaustive: it shows every
supported API documentation field in one definition. A real operation should
include only the path parameters, query-string parameters, cookies, body, and
responses that form part of its contract.

```ts
import Type from "typebox";
import {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
} from "@voyzu/types";
import {
  IceCreamResponseDto,
  IceCreamUpdateRequestDto,
} from "@voyzu/ice-creams/types";

update: {
  method: "PUT",
  path: "/ice-creams/[code]",
  handler: handleUpdate,
  summary: "Update ice cream",
  description: "Fully replaces the writable fields of an ice cream.",
  tags: ["Ice Creams"],
  request: {
    path: {
      code: {
        description: "Globally unique ice-cream business code.",
        schema: Type.String({ pattern: "^[A-Z0-9_-]+$" }),
      },
    },
    query: {
      parameters: {
        validateOnly: {
          description: "Validate the request without saving changes.",
        },
      },
      schema: Type.Object({ validateOnly: Type.Optional(Type.Boolean()) }),
    },
    cookies: {
      "voyzu-session": {
        description: "Authenticated Voyzu session.",
        required: true,
        example: "session-token",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAgeSeconds: 3600,
      },
    },
    contentType: "application/json",
    body: IceCreamUpdateRequestDto,
  },
  responses: {
      "200": {
        description: "The updated ice cream.",
        contentType: "application/json",
        body: IceCreamResponseDto,
        cookies: {
          "voyzu-session": {
            description: "Refreshed session cookie.",
            action: "set",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAgeSeconds: 3600,
          },
        },
      },
      "400": {
        description: "Validation failed.",
        body: InputValidationErrorResponseDto,
      },
      "404": {
        description: "Ice cream not found.",
        body: EntityNotFoundErrorResponseDto,
      },
      "409": {
        description: "The request conflicts with existing data.",
        body: ConflictErrorResponseDto,
      },
      "422": {
        description: "A business rule blocked the update.",
        body: BusinessRuleErrorResponseDto,
      },
      "500": {
        description: "An unexpected server error occurred.",
        body: InternalServerErrorResponseDto,
      },
  },
}
```

Reference exported TypeBox schemas directly. Use `Type.Array(DtoSchema)` for an
array response or request. The router validates these same schemas at runtime,
and the generator uses them for JSON schemas and representative examples.

### Describe DTO fields

Add concise `description` metadata to TypeBox properties where their meaning is
not obvious. Structural constraints belong in the schema itself.

```ts
export const IceCreamUpdateRequestDto = StrictObject({
  name: Type.String({ minLength: 1, description: "Ice-cream display name." }),
  flavorCode: Type.String({
    pattern: "^[A-Z0-9_-]+$",
    description: "Code of the active flavour assigned to the ice cream.",
  }),
  supplier: Type.String({ minLength: 1, description: "Supplier display name." }),
});
export type IceCreamUpdateRequestDto = Type.Static<typeof IceCreamUpdateRequestDto>;
```

`voyzu:compose` reads the registered modules of every active package, extracts
their `apiDefinitions`, resolves referenced DTOs, and writes package-grouped
operation and DTO documents together with the combined OpenAPI document. The
API Reference UI reads those generated files; it does not inspect handlers at
runtime.

## Use dynamic path parameters

Dynamic segments use Next.js bracket syntax in `api.routes.ts`:

```ts
// packages/@acme/warehousing/modules/stock/api.routes.ts
{
  method: "GET",
  path: "/warehousing/stock/[code]",
  handler: handleGet,
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
  // The router has validated code; parse it as needed, call the service,
  // and return a NextResponse.
}
```

The router validates declared path and query-string schemas before invoking the
handler. Values still arrive at the handler as their original strings, so parse
or normalize them into the service's expected types without repeating the
contract validation.

## Keep handlers thin

HTTP handlers must:

1. read and normalize the already validated path, query-string, cookie, and
   body input;
2. call a server service;
3. translate the result into a response DTO; and
4. map known errors to appropriate HTTP status codes.

Handlers must not contain persistence queries or duplicate business rules.
Services own business operations and repositories own SQL.

## Return standard error responses

Handlers must translate known failures to the shared Voyzu error-response DTOs.
Every `responses` object must document each error the operation can
return as well as its successful response.

| Status | When to return it | Shared response DTO |
|---|---|---|
| `400` | The path, query string, or request body is malformed or fails validation. | `InputValidationErrorResponseDto` |
| `401` | The caller is not authenticated. | `UnauthorizedErrorResponseDto` |
| `403` | The authenticated caller lacks permission. | `ForbiddenErrorResponseDto` |
| `404` | The requested entity does not exist. | `EntityNotFoundErrorResponseDto` |
| `409` | The request conflicts with an existing value or state, such as a duplicate code. | `ConflictErrorResponseDto` |
| `422` | The request is valid but a business rule blocks the operation. | `BusinessRuleErrorResponseDto` |
| `500` | An unexpected server failure occurs. | `InternalServerErrorResponseDto` |

Use the matching shared error classes in services and translate them at the
HTTP boundary. Authentication and authorization may be handled by the runtime
before the module handler runs. Unexpected errors must be logged server-side
and returned as the standard `500` response; never expose raw database errors,
stack traces, or other implementation details.

Use `200` for successful reads and updates with a response body, `201` for
successful creates, and `204` for successful operations that return no body.

## Keep DTOs at the package boundary

Request and response DTOs belong to the package that owns the API. Export DTOs
that other packages are allowed to consume through an explicit `package.json`
export. Use `@voyzu/types` for framework-wide contracts such as filtering,
standard errors, auditing, and package definitions.

Do not use database row types as API DTOs. Map rows to explicit response
objects so that internal schema changes do not silently change the public API.

## Compose API changes

Run `npm run voyzu:compose` after adding or changing an API definition or DTO.
Composition reads each active package's `voyzu.package.ts`, updates the shared
package registry, generates package-grouped API documentation beneath
`apps/web/.generated/api-reference`, writes the combined
OpenAPI document, and clears the Next.js cache.

Do not edit generated registries or API documentation files. Restart the web server
after `voyzu:compose` completes so the application loads the regenerated registry
and documentation.
