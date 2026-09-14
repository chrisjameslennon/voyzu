# Data Patterns

## Database responsibilities

PostgreSQL enforces data integrity; application services own business processes. Tables must use foreign keys, uniqueness constraints, nullability, and check constraints so invalid data cannot be inserted by bypassing the application.

Business tables should normally have:

* an auto-generated integer `id` used for relationships and auditing. This is generally the primary key;
* a stable, human-readable text `code` used as the public business key;
* the standard creation, update, and deletion audit fields.

Relationship, reference, and other implementation tables may use a different key shape when the data model requires it. For example the `country` table uses the ISO country code as the primary key.

Every business table should have an audit trigger that invokes the shared `audit_trigger_fn` function.

Package schema and seed SQL belongs in the package's `install/` directory and is listed in installation order by `voyzu.package.ts`. SQL file names do not control execution order.

## Database coupling

A package owns the tables created by its install SQL. Database dependencies may point to the package's own tables or upstream to a package it depends on. They must not point sideways to a peer package or downstream to a package that depends on it.

This rule applies equally to foreign keys, trigger functions, and SQL queries, including joins, reads, and writes. Moving a query into a repository does not make an otherwise prohibited dependency acceptable.

For example:

| Dependency | Permitted? |
| --- | --- |
| A business package → platform tables | Yes: all business packages depend on the platform |
| Finance or Inventory → Platform Organization tables | Yes: Organization is preinstalled in Platform |
| Finance → Inventory tables, or Inventory → Finance tables | No: they are peers |
| Platform → business-package tables | No: these are downstream packages |

Table ownership is determined by installation, not by a table-name prefix. A generic audit trigger that reads the triggering row through `OLD`/`NEW` and writes Audit-owned tables is an upstream use of platform auditing; it must not query business-package tables by name.

Use the internal API for cross-package operations that cannot use an allowed database dependency. Do not replace a forbidden query with a direct import of the other package's repository or service.

## Shared data through the internal API

The internal API replaces the former master-data/semantic-data and capability APIs. Contracts reference DTOs and declare methods; packages register definitions, implementations and Platform composition through `contracts.internalApi` in `voyzu.package.ts`.

Platform implements `@core/country`; Finance implements `@erp/country-finance`. Platform composes `@erp/country-with-finance` through internal API calls without importing Finance.

```ts
import { internalApi } from "@voyzu/capability/internal-api";

const country = await internalApi.call("@core/country", "get", { code: "NZ" });
const countryWithFinance = await internalApi.call("@erp/country-with-finance", "get", { code: "NZ" });
// Country fields plus a finance property; null if either record is missing.
```

Both retrieval and modification use declared methods. `call` throws when a provider is missing; `callOptional` returns null instead. A composed object is null when a required record is absent, but a missing implementation remains an error. Transaction settings belong to implementations, not definitions.

See [Internal API](../platform-contracts/internal-api-contract.md) for DTOs, methods, composition, transactions and runtime validation.

## Data transfer objects (DTOs)

A Data Transfer Object (DTO) is the definitive definition of data as it is described within the application. DTOs define data exchanged through the application and HTTP API boundaries.

DTOs describe the shape of a data object as it applies to a given data operation. There is no attempt, for example, to define a single "stock object"; rather, there are multiple definitions depending on the data operation.

```ts
// packages/@acme/warehousing/types/modules/stock/stock.dto.ts
import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuditMetadataDto } from "@voyzu/types/modules/core";

// a code value must be supplied
export const StockItemCreateRequestDto = StrictObject({
  code: Type.String({ pattern: "^[A-Z0-9_-]+$" }),
  name: Type.String({ minLength: 1 }),
  supplierCode: Type.Optional(Type.String({ pattern: "\\S" })),
  reorderLevel: Type.Optional(Type.Integer({ minimum: 0 })),
});
export type StockItemCreateRequestDto = Type.Static<typeof StockItemCreateRequestDto>;

// code cannot be supplied as code is invalid in a patch request
export const StockItemPatchRequestDto = Type.Partial(
  Type.Omit(StockItemCreateRequestDto, ["code"]),
  { additionalProperties: false },
);
export type StockItemPatchRequestDto = Type.Static<typeof StockItemPatchRequestDto>;

// audit properties are returned in a GET response
// but not present in data create DTOs
export const StockItemGetResponseDto = StrictObject({
  id: Type.Integer({ minimum: 1 }),
  code: Type.String({ pattern: "^[A-Z0-9_-]+$" }),
  name: Type.String({ minLength: 1 }),
  supplierCode: Type.Union([Type.String({ pattern: "\\S" }), Type.Null()]),
  reorderLevel: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
  audit: AuditMetadataDto,
});
export type StockItemGetResponseDto = Type.Static<typeof StockItemGetResponseDto>;
```

The create DTO includes `code` because the stable business code is assigned when the entity is created. The patch DTO deliberately omits `code` because a business code cannot be changed.

Create and patch DTOs must not accept audit details. Audit timestamps, actors, users, and mutation identifiers are generated by the system rather than supplied by an HTTP API caller. The response DTO includes the resulting system-generated audit information through `AuditMetadataDto`.

The HTTP API router validates these TypeBox schemas before calling a handler and validates declared response schemas after the handler returns. Services and validators enforce business rules rather than repeating object-shape validation.

Database row types are internal persistence shapes. Map them to DTOs rather than returning rows directly.

## Data Repository

A Data Repository in Voyzu is code that controls read and write data access. Repositories own SQL and row mapping. All database access must be via a Data Repository. The general pattern is that a module service file calls a data repository file, and all interactions go through the service module.

SQL queries and their execution belong in `.repo.ts` files, not in pages, handlers, services, or script entry points. This also applies to sample-data scripts and test lookups. Install SQL remains in the installation files described above. The platform System Info diagnostics are an explicit exception and may query PostgreSQL system information directly.

Repositories accept a `DbExecutor` from `@voyzu/capability/db`. A service may
pass the shared pool for an ordinary read or a transaction client for atomic
work:

```ts
// packages/@acme/warehousing/modules/stock/server/db/stock.repo.ts
import type { DbExecutor } from "@voyzu/capability/db";

export class StockRepo {
  constructor(private readonly db: DbExecutor) {}

  async getByCode(code: string) {
    const result = await this.db.query(
      "select id, code, name from stock where code = $1",
      [code],
    );
    return result.rows[0] ?? null;
  }
}
```

The platform owns the shared connection pool. Application request code must not call `pool.end()`. A standalone process that deliberately creates and owns its process lifetime may close the pool when it exits.

## Transactions

Use `withTransaction` when a business operation changes multiple rows or must share one audit mutation:

```ts
// packages/@acme/warehousing/modules/stock/server/lib/stock.service.ts
import { withTransaction } from "@voyzu/capability/db";

await withTransaction(async (client) => {
  await new StockRepo(client).update(code, patch);
  await new StockMovementRepo(client).create(movement);
});
```

Pass the transaction client through the service and repository layers. Do not open nested independent transactions for work that must commit atomically.

## Naming and SQL safety

Use `snake_case` for PostgreSQL identifiers and keep terminology consistent between tables, DTOs, services, and APIs. Always bind values as query parameters. Never concatenate untrusted values into SQL.

Dynamic identifiers, such as a permitted sort column, must be selected from an explicit allow-list before being included in a statement.

## See also

* [Internal API](../platform-contracts/internal-api-contract.md)
* [Validation layers](validation-layers.md)
* [Auditing patterns](auditing-patterns.md)
* [HTTP API patterns](http-api-patterns.md)
