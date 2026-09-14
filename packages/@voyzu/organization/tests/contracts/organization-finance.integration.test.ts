import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { internalApi, registerInternalApi, resolveInternalApiContracts, createLazyInternalApiResource } from "@voyzu/capability/internal-api";
import { getDb, withTransaction } from "@voyzu/capability/db";
import { createOrganization } from "../../modules/organizations/server/lib/organization.service";
import { OrganizationRepo } from "../../modules/organizations/server/db/organization.repo";
import organization from "../../voyzu.package";
import shared from "../../../shared-contracts/voyzu.package";
import auth from "../../../auth/voyzu.package";
import businessObjects from "../../../business-objects/voyzu.package";
import party from "../../../party/voyzu.package";

// Requires the composed development runtime, initialized DB and Finance settings for NZ.
// Every write is rolled back, including automatic Finance provisioning.
test("organization and Finance internal API calls share a transaction", async () => {
  const runtime = process.env.VOYZU_WORKSPACE_ROOT;
  if (!runtime) throw new Error("Run through npm run test:contracts");
  const { default: finance } = await import(pathToFileURL(resolve(runtime, "packages/@voyzu/ledger/voyzu.package.ts")).href);
  const platform = [
    { name: "@voyzu/business-objects", isPlatform: true, contracts: businessObjects.contracts },
    { name: "@voyzu/party", isPlatform: true, contracts: party.contracts },
    { name: "@voyzu/shared-contracts", isPlatform: true, contracts: shared.contracts },
    { name: "@voyzu/organization", isPlatform: true, contracts: organization.contracts },
    { name: "@voyzu/auth", isPlatform: true, contracts: auth.contracts },
  ];
  function register(withFinance: boolean) {
    const config = resolveInternalApiContracts([...platform, ...(withFinance ? [{ name: "@voyzu/ledger", contracts: finance.contracts }] : [])]);
    registerInternalApi([...config.definitions].map(([name, { definition }]) => createLazyInternalApiResource(name, definition, config.providers.get(name)?.load)));
  }
  const code = `CT${randomUUID().replaceAll("-", "").slice(0, 12)}`.toUpperCase();
  const rollback = new Error("test rollback");
  try {
    await assert.rejects(withTransaction(async () => {
      register(false);
      assert.equal(internalApi.has("@erp/organization-finance"), false);
      const org = await createOrganization({ code, name: "Contract integration test", countryCode: "NZ", baseCurrencyCode: "NZD" });
      assert.equal(await internalApi.callOptional("@erp/organization-finance", "get", { organization_id: org.id }), null);
      await assert.rejects(internalApi.call("@erp/organization-with-finance", "get", { organization_id: org.id }), /No implementation/);
      register(true);
      const result = await internalApi.call("@erp/organization-finance", "createFinancialEntity", { organization_id: org.id });
      const composed = await internalApi.call("@erp/organization-with-finance", "get", { organization_id: org.id });
      assert.equal(composed?.organization_id, org.id);
      assert.equal(composed?.finance.financeCompanyId, result.financialEntityId);
      assert.equal(composed?.finance.financeCompanyId, result.financialEntityId);
      const automatic = await createOrganization({ code: `${code.slice(0, 13)}A`, name: "Automatic Finance test", countryCode: "NZ", baseCurrencyCode: "NZD" });
      assert.ok((await internalApi.call("@erp/organization-finance", "get", { organization_id: automatic.id }))?.financeCompanyId);
      throw rollback;
    }), error => error === rollback);
    assert.equal((await new OrganizationRepo(getDb()).findIdByCode(code)).rows.length, 0);
  } finally {
    const directory = resolve(runtime, "voyzu/apps/web/.generated/internal-api");
    const [preinstalled, installed] = await Promise.all([
      import(pathToFileURL(resolve(directory, "pre-installed.ts")).href),
      import(pathToFileURL(resolve(directory, "installed.ts")).href),
    ]);
    registerInternalApi([...preinstalled.internalApiResources, ...installed.internalApiResources]);
  }
});
