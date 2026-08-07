# Testing patterns

Package tests are service-level integration tests. They call public service
functions directly and use fixtures to create and remove database state. They
are not browser or DOM tests.

## Keep tests with the module

```text
packages/@acme/warehousing/
  modules/
    stock/
      server/
      tests/
        stock.fixtures.ts
        stock.spec.ts
```

Keep fixtures close to the module unless several modules genuinely share them.
Test public service functions rather than repositories or HTTP handlers:

```ts
// packages/@acme/warehousing/modules/stock/tests/stock.spec.ts
import { expect, test } from "./stock.fixtures";
import {
  activateStock,
  createStock,
  deactivateStock,
  patchStock,
} from "../server";
```

The package must declare its chosen test runner as a development dependency and
provide a package script that runs the suite. Voyzu's reference packages use
Playwright's test runner for database integration tests.

## Test exposed behavior

Every meaningful service operation exposed through UI or API must have a
corresponding service test. Cover list, get, create, replace, patch, state
transitions, delete, search, filtering, reports, and batch operations when the
module provides them.

Assert the returned DTO and the important persisted outcome:

```ts
test("creates stock", async ({ stock }) => {
  const input = stock.newInput();
  const created = await createStock(input);
  stock.track(created.code);

  expect(created.code).toBe(input.code);
  expect(created.name).toBe(input.name);
  expect(created.status).toBe("ACTIVE");
  expect(created.id).toBeGreaterThan(0);
});

test("deactivates and reactivates stock", async ({ stock }) => {
  const item = await stock.create();

  expect((await deactivateStock(item.code)).status).toBe("INACTIVE");
  expect((await activateStock(item.code)).status).toBe("ACTIVE");
});
```

Test full replacement and partial patch separately when both are supported.
Test single and batch functions separately. A failed atomic batch must leave no
earlier item changed.

## Test unhappy paths

Cover the important failure modes:

* missing or malformed input;
* duplicate business codes;
* missing referenced records;
* inactive dependencies;
* invalid state transitions;
* deletion of records that are in use;
* protected-field changes after dependent activity exists; and
* batch rollback.

Assert both the error and the absence of an invalid side effect:

```ts
test("does not change an in-use stock code", async ({ stock }) => {
  const item = await stock.createInUse();

  await expect(
    changeStockCode(item.code, stock.uniqueCode()),
  ).rejects.toThrow(/code.*cannot be changed/i);

  expect((await getStock(item.code))?.code).toBe(item.code);
});
```

## Use fixtures

Fixtures own test data. They create valid prerequisites, issue unique business
codes, track created records, and clean them up after the test.

```ts
// packages/@acme/warehousing/modules/stock/tests/stock.fixtures.ts
import { randomUUID } from "node:crypto";
import { expect, test as base } from "@playwright/test";
import { createStock } from "../server";
import { teardownStock } from "./support/teardown-stock";

export const test = base.extend<{ stock: StockFixture }>({
  stock: async ({}, use) => {
    const createdCodes = new Set<string>();
    const uniqueCode = () =>
      `PW${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase();

    const fixture: StockFixture = {
      uniqueCode,
      newInput: () => ({
        code: uniqueCode(),
        name: "Playwright stock item",
      }),
      async create() {
        const item = await createStock(this.newInput());
        createdCodes.add(item.code);
        return item;
      },
      track: (code) => createdCodes.add(code),
    };

    try {
      await use(fixture);
    } finally {
      await teardownStock([...createdCodes]);
    }
  },
});

export { expect };
```

Cleanup in `finally` is mandatory. Teardown must be idempotent, remove records
in reverse dependency order, remove test audit events where required, and
restore any shared reference data the test changed.

Use unique, recognizable codes for every test and worker. Tests must not depend
on execution order or data left behind by another run.

## Keep service entry points Node-safe

Tests and package scripts may execute outside Next.js. Their service entry
point must not transitively load SSR pages that import `server-only`.

```ts
// modules/stock/server/index.ts
export { createStock, getStock, patchStock } from "./lib/stock.service";

// modules/stock/server/pages/index.ts
export { StockListPage } from "./StockListPage";
```

Import SSR pages directly from the page entry point in `module.ts`; do not
re-export them from the Node-safe service barrel.

## Checklist

1. Keep tests below the owning module.
2. Call public services, not repositories or HTTP handlers.
3. Cover successful behavior and important business-rule failures.
4. Assert persisted outcomes and rejected side effects.
5. Use unique fixture data and make teardown idempotent.
6. Leave no business, relationship, or audit fingerprint.
