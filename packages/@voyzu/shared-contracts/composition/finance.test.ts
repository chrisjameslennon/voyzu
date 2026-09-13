import assert from "node:assert/strict";
import { test } from "node:test";
import type { InternalApiInvoker } from "@voyzu/types/internal-api";
import { createCountryWithFinanceMethods, createOrganizationWithFinanceMethods } from "./finance.implementation";

function invoker(records: Record<string, unknown>): InternalApiInvoker {
  return {
    has: name => Object.hasOwn(records, name),
    async call(name) {
      if (!Object.hasOwn(records, name)) throw new Error(`No implementation for ${name}`);
      return records[name];
    },
    async callOptional(name) { return records[name] ?? null; },
  };
}
test("Finance composition returns the complete object or null, never a partial object", async () => {
  const country = { code: "NZ", name: "New Zealand" };
  const finance = { code: "NZ", taxFilingAnchorMonth: 3 };
  assert.deepEqual(await createCountryWithFinanceMethods(invoker({ "@core/country": country, "@erp/country-finance": finance })).get({ code: "NZ" }), { ...country, finance });
  for (const [base, extension] of [[null, finance], [country, null], [null, null]]) {
    assert.equal(await createCountryWithFinanceMethods(invoker({ "@core/country": base, "@erp/country-finance": extension })).get({ code: "NZ" }), null);
  }
});
test("Missing Finance implementation is an error even if the base record is missing", async () => {
  await assert.rejects(createCountryWithFinanceMethods(invoker({ "@core/country": null })).get({ code: "NZ" }), /No implementation/);
  const organization = createOrganizationWithFinanceMethods(invoker({ "@core/organization": null }));
  await assert.rejects(organization.get({ organization_id: 1 }), /No implementation/);
  await assert.rejects(organization.findByCode({ code: "MISSING" }), /No implementation/);
});
