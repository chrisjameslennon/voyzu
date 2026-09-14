# HTTP API patterns

HTTP API registration uses `contracts.httpApiRouting` (roots and routes keyed by stable ID, including operation descriptions) and `contracts.httpApiDocumentation` (sections, groups and ordered route references). Every route needs exactly one documentation entry. Section titles become package-qualified OpenAPI tags; route IDs become operation IDs. See the [HTTP API contract](../platform-contracts/http-api-contract.md) for the complete example. Module exports alone do not register HTTP routes.

Voyzu composes package HTTP API definitions into a registry consumed by the platform wildcard HTTP API handler:

```text
apps/web/app/api/[[...voyzuHttpApiPath]]/route.ts
```

Packages register HTTP routes through `voyzu.package.ts` contracts. A package may import route definitions from source modules and flatten them into `contracts.httpApiRouting.routes`. The wildcard handler matches method and path; route IDs remain stable across path changes.

## Define routes in `http-api.routes.ts`

Each HTTP API definition must provide an HTTP method, a path, and a lazy,
type-checked handler loader. Keep the handler implementation in the module's
server boundary.

```ts
// packages/@acme/warehousing/modules/stock/http-api.routes.ts
export const httpApiRoutes = {
  "acme.example.list": {
    method: "GET",
    path: "/warehousing/stock",
    loadHandler: () => import("./server/http-api/stock.http.handlers")
      .then((module) => module.handleList),
  },
  "acme.example.create": {
    method: "POST",
    path: "/warehousing/stock",
    loadHandler: () => import("./server/http-api/stock.http.handlers")
      .then((module) => module.handleCreate),
  },
  "acme.example.get": {
    method: "GET",
    path: "/warehousing/stock/[code]",
    loadHandler: () => import("./server/http-api/stock.http.handlers")
      .then((module) => module.handleGet),
  },
} as const;
```

Register these definitions in the package HTTP API contract. Module HTTP route exports are optional implementation conveniences, not composition discovery points. HTTP-only packages declare their HTTP contracts directly; no module-registration list is needed.

At runtime the route is prefixed with `/api`, so the example above exposes
`GET /api/warehousing/stock`, `POST /api/warehousing/stock`, and
`GET /api/warehousing/stock/{code}`.
Next.js performs path matching, parameter extraction and method dispatch. The
thin Voyzu handler retains authentication plus request and response validation.

## Implement the standard HTTP API methods

Unless a module has a particular reason to expose a different contract, it
should implement the following 17 HTTP API methods. Using this standard gives Voyzu
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
Voyzu HTTP API convention. Do not invent alternative names or HTTP methods for
these standard operations. A module should omit an operation when its domain
rules make that operation inappropriate. For example, the Voyzu Audit module
is read-only: audit events are immutable records and cannot be created,
updated, activated, deactivated, or deleted through the Audit HTTP API. It therefore
exposes only the read operations that make sense for audit events rather than
implementing all 17 methods. Document the reason for any such deviation in the
module.

The combination of method and path must be unique across all composed modules.
Use the package's domain vocabulary in paths to avoid collisions with other
packages.

## Document every HTTP API operation

Routing definitions supply the short summary, method, path, DTO schemas and response statuses. Package documentation supplies sections, groups and ordered route references. See the complete [HTTP API contract example](../platform-contracts/http-api-contract.md).

Each operation must belong to one group within a section. Groups may reference another installed package's route by its stable ID. Declaration order controls navigation and page order. OpenAPI uses the route ID as its operation ID and the documentation package plus section title as its tag.

Path and query DTOs describe strings at the HTTP boundary. Repeated query values are arrays of strings only when declared as arrays; repeated scalar parameters return 400. Handlers explicitly convert accepted values when needed.

Cookie declarations are arrays of required names. Request validation checks presence; response validation checks outgoing Set-Cookie names for the response status, including clearing cookies. Cookie values and attributes are not schema-validated by the route contract. Use shared cookie helpers from @voyzu/http-api/cookies to set and clear cookies with platform policy.

Reference exported TypeBox DTO schemas directly. The same schemas drive runtime validation and generated examples. Omit both body and contentType for a response with no body.

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

`voyzu:compose` reads `contracts.httpApiRouting` and `contracts.httpApiDocumentation` from package definitions and writes
generated registrations containing package ownership, stable route IDs, routing definitions and documentation. The generator serializes the same DTO schemas used by runtime validation and does not invoke HTTP handler loaders. The HTTP API Reference UI reads the generated operation documents
and combined OpenAPI document; it does not inspect handlers at runtime.

## Use dynamic path parameters

Dynamic segments use Next.js bracket syntax in `http-api.routes.ts`:

```ts
// packages/@acme/warehousing/modules/stock/http-api.routes.ts
{
  method: "GET",
  path: "/warehousing/stock/[code]",
  loadHandler: () => import("./server/http-api/stock.http.handlers")
    .then((module) => module.handleGet),
}
```

The router resolves matched values through `context.params`:

```ts
// packages/@acme/warehousing/modules/stock/server/http-api/get.http.handlers.ts
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

Request and response DTOs belong to the package that owns the HTTP API. Export DTOs
that other packages are allowed to consume through an explicit `package.json`
export. Use `@voyzu/types` for framework-wide contracts such as filtering,
standard errors, auditing, and package definitions.

Do not use database row types as HTTP API DTOs. Map rows to explicit response
objects so that internal schema changes do not silently change the public HTTP API.

## Compose HTTP API changes

Run `npm run voyzu:compose -- --routing-only` after adding or changing an HTTP API definition, documentation group or DTO.
Composition regenerates `http-api-routes/pre-installed.ts` and `http-api-routes/installed.ts`. Both package groups use the same route
type, lazy-loader validation, root ownership checks, and registry shape. The
documentation build consumes both indexes, generates package-grouped HTTP API
documentation beneath
`apps/web/.generated/http-api-reference`, and writes the combined OpenAPI document.
The installed index is preserved by ordinary `npm run dev` startup, so starting
the platform does not discard an existing installed-package composition.

Do not edit generated registries or HTTP API documentation files. Restart the web server
after `voyzu:compose` completes so the application loads the regenerated registry
and documentation.
