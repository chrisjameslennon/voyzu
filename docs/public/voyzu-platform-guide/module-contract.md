# Module contract

The locations below are relative to the package repository root. Each rule states whether it belongs in package metadata, a module definition, navigation, or the module's supporting source directories.

## Module structure and registration

### Source location

A module should reside beneath the owning package's `modules/module-name` directory. Its entry point must be `module.ts`; supporting client, domain and server code belongs beneath the same module directory.

Example:

```
# package repository root
packages/@acme/warehousing/
└─ modules/
   └─ stock/
      ├─ module.ts
      ├─ client/
      ├─ domain/
      └─ server/
```

### Module definition

A module definition must provide `pageRoutes` and `apiDefinitions`. The route collections must be objects and may be empty. The definition belongs in `modules/module-name/module.ts`.

Example:

```ts
// packages/@acme/warehousing/modules/stock/module.ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

export const stockModule = {
  pageRoutes: {},
  apiDefinitions: {},
} as const satisfies VoyzuPackageModuleDefinition;
```

### Package registration

A module must be imported and included in the owning package's `modules` collection. Voyzu does not discover modules by scanning the package's `modules` directory. Registration belongs in the package-level `voyzu.package.ts`.

Example:

```ts
// packages/@acme/warehousing/voyzu.package.ts
import { stockModule } from "./modules/stock/module";

export default {
  // ...
  modules: [stockModule],
};
```

## Page routes

### User-interface capability

A module exposes its user-interface pages by registering them in the `pageRoutes` collection in the module's `module.ts`. This collection is the module's authoritative list of pages and allows Voyzu to generate native Next.js pages while composing authorization, page metadata and navigation references into the application.

A module with no user-interface pages must define an empty `pageRoutes` object.

### Route definitions

Each page route must define a stable `id`, a unique application `path`, a `pageTitle` and a React `Page` component. Dynamic URL segments must use the Next.js bracket convention. Page-route registration belongs in the module's `module.ts`; page components normally belong under the module's `server/pages` or client directory.

Example:

```ts
// packages/@acme/warehousing/modules/stock/module.ts
pageRoutes: {
  detail: {
    id: "acme.warehousing.stock.page.detail",
    path: "/stock/[code]",
    pageTitle: "Stock item",
    Page: StockDetailPage,
    auth: { required: true, minRole: "ORGANIZATION_USER" },
  },
},
```

### Authorization

A page route should declare its authentication and minimum-role requirements explicitly. A protected page must use one of the Voyzu surface roles. Authorization metadata belongs on the page-route entry in the module's `module.ts`.

Example:

```ts
// packages/@acme/warehousing/modules/stock/module.ts
auth: {
  required: true,
  minRole: "ORGANIZATION_USER",
},
```

### Metadata

A page route may provide breadcrumbs, help, and framing metadata. These values must describe the route without introducing navigation paths that conflict with the route definition. This metadata belongs on the page-route entry in the module's `module.ts`. A `helpPath` must be relative to the `voyzu.settings.helpBaseUrl` declared by the owning package.

Example:

```ts
// packages/@acme/warehousing/modules/stock/module.ts
{
  breadcrumbBase: [{ label: "Stock", href: "/stock" }],
  helpPath: "packages/warehousing/stock",
  unframed: false,
}
```

See [Documentation and help](../voyzu-platform-patterns/documentation-and-help.md) for the package-level help setting and publishing pattern.

### Navigation references

Package navigation must refer to a module page by its route `id`. A module must not require navigation to be usable; modules may be API-only or server-only. Navigation definitions belong in the owning package's `navigation` directory, not in the module definition.

Example:

```ts
// packages/@acme/warehousing/navigation/left-nav.leftnav.ts
{
  label: "Stock",
  routeId: stockModule.pageRoutes.list.id,
}
```

## API routes

### API capability

A module exposes its HTTP API by registering its routes in the `apiDefinitions` collection in the module's `module.ts`. This collection is the module's authoritative list of endpoints and allows Voyzu to compose handlers and route matching into the application.

A module with no HTTP API must define an empty `apiDefinitions` object.

### Route definitions

Each entry in `apiDefinitions` defines one HTTP endpoint. It must specify an HTTP `method`, a path relative to Voyzu's `/api` base path and an asynchronous `handler`. The combination of method and path must be unique across the composed application.

API routes must follow REST principles. Paths must identify resources using nouns, HTTP methods must express the operation using their standard semantics, and handlers must return appropriate HTTP status codes. Route registration belongs in the module's `module.ts`; handler implementations belong under `server/api`.

Example:

```ts
// packages/@acme/warehousing/modules/stock/module.ts
apiDefinitions: {
  get: {
    method: "GET",
    path: "/stock/[code]",
    handler: handleGetStock,
  },
},
```

### Request and response contracts

An API route should use explicit DTOs for request bodies, path parameters, query parameters and responses. Shared Voyzu request and error DTOs should be reused rather than redefined. Domain DTOs belong in the owning package's types area and must be exposed through a public export when other packages consume them.

Example:

```ts
// packages/@acme/warehousing/modules/types/stock.ts
import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const StockItemCreateRequestDto = StrictObject({
  code: Type.String({ pattern: "^[A-Z0-9_-]+$" }),
  name: Type.String({ minLength: 1 }),
});
export type StockItemCreateRequestDto = Type.Static<typeof StockItemCreateRequestDto>;

export const StockItemResponseDto = StrictObject({
  id: Type.Integer({ minimum: 1 }),
  code: Type.String({ pattern: "^[A-Z0-9_-]+$" }),
  name: Type.String({ minLength: 1 }),
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
});
export type StockItemResponseDto = Type.Static<typeof StockItemResponseDto>;
```

## Module implementation

### Validation

A module declares TypeBox request and response schemas in its API definition; the router validates them at the transport perimeter. Cross-field and domain validators belong under `server/lib`, while database-dependent rules belong in services or operation policies. Validators must not repeat object constraints already declared by DTO schemas.

Example:

```ts
// packages/@acme/warehousing/modules/stock/server/lib/stock-item.service.ts
const errors = validateCreate(input);
if (errors.length) {
  throw new InputValidationError(errors.join("; "));
}
```

See the pattern [validation-layers.md](../voyzu-platform-patterns/validation-layers.md "mention")

### Business rules

Business rules must reside in the module's domain or service layer rather than in React pages or HTTP route registration. Rule failures must produce stable, meaningful Voyzu business errors. Rules belong under `domain` or `server/lib`.

Example:

```ts
// packages/@acme/warehousing/modules/stock/server/lib/stock-item.service.ts
if (warehouse.status !== "ACTIVE") {
  throw new BusinessRuleError("The warehouse is inactive.");
}
```

### Server boundary

Server-only code must remain under the module's server boundary and must not be imported by client components. Client-safe entry points must not re-export database, credential or server-only functionality. The boundary is expressed by separate `client` and `server` directories and entry points.

SSR page components may import `server-only`. A Node-safe service barrel used by tests and scripts must not re-export those pages; expose SSR pages through a separate page entry point.

Example:

```
# packages/@acme/warehousing/
modules/stock/
├─ client/index.ts       # client-safe exports
├─ server/index.ts       # Node-safe services and handlers
└─ server/pages/index.ts # SSR page exports
```

### Persistence

Database access must be isolated behind module-owned repositories or services. Pages and HTTP handlers must not issue ad hoc database queries. Repository code belongs under `server/db`; orchestration belongs under `server/lib`.

Example:

```ts
// packages/@acme/warehousing/modules/stock/server/lib/stock-item.service.ts
const stockItem = await StockItemRepo.getByCode(code);
```

### Auditing

A module that mutates auditable business data must use Voyzu's audit contracts and propagate the current actor and mutation context. Audit records must be written as part of the same business operation. Audit stamping normally occurs in the module's service layer before repository persistence.

Example:

```ts
// packages/@acme/warehousing/modules/stock/server/lib/stock-item.service.ts
const audit = await createUpdateAuditStamp();
await StockItemRepo.update(code, withUpdateAudit(update, audit));
```

### Public module APIs

Module functionality intended for use by another package must be exported through a package-level public entry point. Consumers must not import private module files. The public entry point belongs in the providing module, and the export mapping belongs in the owning package's `package.json`.

Example:

```jsonc
// packages/@acme/warehousing/package.json
{
  "exports": {
    "./modules/stock/server": "./modules/stock/server/index.ts"
  }
}
```

```ts
// packages/@acme/manufacturing/modules/work-orders/server/lib/work-order.service.ts
import { StockService } from "@acme/warehousing/modules/stock/server";
```

## Quality and guidance

### Testing

A module should test its domain rules, request and response validation, and exposed service behaviour at the narrowest useful boundary. Repository outcomes should be verified through services rather than by testing private repositories directly. Tests should reside within the module or in the repository's corresponding package test area.

Example:

```
# packages/@acme/warehousing/
modules/stock/
└─ tests/
   ├─ stock-item.service.test.ts
   └─ stock-item.validator.test.ts
```

### Voyzu patterns

A module should follow the established Voyzu patterns for data, APIs, application surfaces, validation, auditing, integration and testing unless the module documents a deliberate exception.

Example:

See the patterns for [data](../voyzu-platform-patterns/data.md), [APIs](../voyzu-platform-patterns/api-patterns.md), [application surfaces](../voyzu-platform-patterns/app-surface.md), [validation](../voyzu-platform-patterns/validation-layers.md), [auditing](../voyzu-platform-patterns/auditing-patterns.md), and [testing](../voyzu-platform-patterns/tests.md).

### Reference package

The Voyzu Ice Creams package conforms to this contract and demonstrates many of the established module and application patterns in use.

[View the Ice Creams reference package on GitHub](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ice-creams)
