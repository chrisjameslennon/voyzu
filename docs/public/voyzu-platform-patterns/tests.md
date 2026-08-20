# Testing patterns

Package tests are database-backed integration tests of module operations. They
call the package's public operations facade and use fixtures only to arrange and
remove database state. They are not HTTP, browser, or DOM tests.

## Keep operation tests at package level

Each package owns one test directory, organized by module:

```text
packages/@acme/warehousing/
  modules/
    stock/
      operations.ts
      server/
  tests/
    operations/
      stock/
        stock.operations.test.ts
```

Every function exported by `operations.ts` must be exercised. Import operations
through the package's stable public subpath rather than importing services,
repositories, or HTTP handlers:

```ts
import {
  activateStock,
  createStock,
  deactivateStock,
  patchStock,
} from "@acme/warehousing/stock/operations";
```

HTTP handlers continue to call services directly. Operations exist for tests
and module-to-module communication; they are thin delegates and add no
validation or business behavior.

## Test exposed behavior

Cover every operation, including list, get, create, replace, patch, state
transitions, delete, search, filtering, reports, and batch operations when the
module provides them. Assert the returned DTO and important persisted outcome:

```ts
test("creates stock", async () => {
  const input = stockFixture.newInput();
  const created = await createStock(input);
  stockFixture.track(created.code);

  assert.equal(created.code, input.code);
  assert.equal(created.name, input.name);
  assert.equal(created.status, "ACTIVE");
  assert.ok(created.id > 0);
});

test("deactivates and reactivates stock", async () => {
  const item = await stockFixture.create();

  assert.equal((await deactivateStock(item.code)).status, "INACTIVE");
  assert.equal((await activateStock(item.code)).status, "ACTIVE");
});
```

Test full replacement and partial patch separately when both are supported.
Test single and batch functions separately. A failed atomic batch must leave no
earlier item changed.

## Test unhappy paths

Cover important business failures such as missing records, invalid state
transitions, deletion of records in use, protected-field changes, and batch
rollback. DTO shape validation belongs to the API perimeter and is tested with
the router rather than repeated in operation tests.

Assert both the error and the absence of an invalid side effect:

```ts
await assert.rejects(
  changeStockCode(item.code, stockFixture.uniqueCode()),
  /code.*cannot be changed/i,
);
assert.equal((await getStock(item.code))?.code, item.code);
```

## Use repeatable fixtures

Fixtures create valid prerequisites, issue unique recognizable business codes,
track created records, and clean them up in `after` or `finally`. Fixture code
may use internal database or context helpers to arrange the boundary conditions,
but the behavior under test must be invoked through public operations.

Cleanup must be idempotent, remove records in reverse dependency order, remove
test audit events where required, and restore shared settings. Tests must not
depend on execution order or state left by another run.

Use the repository's configured operation-test script. Test-only tooling belongs
in development dependencies and must not become a runtime dependency.

## Checklist

1. Put tests in `tests/operations/<module-name>` at the package root.
2. Exercise every public operation through its package export.
3. Do not test through repositories, service internals, or HTTP handlers.
4. Assert successful behavior, persistence, and important business-rule failures.
5. Use unique fixture data and idempotent teardown.
6. Restore shared settings and leave no test records or audit fingerprint.
