import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";

import type { CountryPatchRequestDto } from "@voyzu/localization/types/modules/countries/country.patch.request.dto";
import type { CountryResponseDto } from "@voyzu/localization/types/modules/countries/country.response.dto";
import type { CountryUpdateRequestDto } from "@voyzu/localization/types/modules/countries/country.update.request.dto";

import { getPool } from "@voyzu/capability/db";
import {
  getCountry,
  updateCountry,
  patchCountry,
  listCountries,
  filterCountries,
  searchCountries,
  batchGetCountries,
  batchUpdateCountries,
  batchPatchCountries,
} from "../../../modules/countries/operations";

before(async () => {
  await getPool().query(
    `INSERT INTO country (code, name, currency_code, status)
     VALUES
       ('NZ', 'New Zealand', 'NZD', 'ACTIVE'),
       ('AU', 'Australia', 'AUD', 'ACTIVE')
     ON CONFLICT (code) DO UPDATE
     SET name = EXCLUDED.name,
         currency_code = EXCLUDED.currency_code,
         status = EXCLUDED.status`,
  );
});

after(async () => {
  // Restore test countries to ACTIVE after tests
  try {
    await batchPatchCountries([
      { code: "NZ", status: "ACTIVE" },
      { code: "AU", status: "ACTIVE" },
    ]);
  } catch {
    // best-effort
  }
  await getPool().end();
});

describe("country.service", () => {
  it("gets a country by code", async () => {
    const country = await getCountry("NZ");
    assert.ok(country);
    assert.equal(country.code, "NZ");
    assert.equal(country.name, "New Zealand");
  });

  it("returns null for non-existent code", async () => {
    const country = await getCountry("ZZ");
    assert.equal(country, null);
  });

  it("updates a country by code (full replace)", async () => {
    const existing = await getCountry("NZ");
    assert.ok(existing);

    const input: CountryUpdateRequestDto = {
      code: "NZ",
      name: existing.name,
      currencyCode: existing.currencyCode,
      status: "INACTIVE",
    };
    const country = await updateCountry("NZ", input);

    assert.equal(country.code, "NZ");
    assert.equal(country.status, "INACTIVE");

    // restore
    await updateCountry("NZ", { ...input, status: "ACTIVE" });
  });

  it("patches a country (partial update — status only)", async () => {
    const result = await patchCountry("NZ", { status: "INACTIVE" });
    assert.equal(result.status, "INACTIVE");

    const restored = await patchCountry("NZ", { status: "ACTIVE" });
    assert.equal(restored.status, "ACTIVE");
  });

  it("lists all countries", async () => {
    const countries: CountryResponseDto[] = await listCountries();
    assert.ok(countries.length > 0);
    const nz = countries.find((c) => c.code === "NZ");
    assert.ok(nz);
  });

  it("filters countries by status", async () => {
    const countries = await filterCountries([{ field: "status", operator: "=", value: "ACTIVE" }]);
    assert.ok(countries.length > 0);
    assert.ok(countries.every((c) => c.status === "ACTIVE"));
  });

  it("searches countries by phrase", async () => {
    const countries = await searchCountries("New Zealand");
    const nz = countries.find((c) => c.code === "NZ");
    assert.ok(nz);
  });

  it("batch gets countries by codes", async () => {
    const countries = await batchGetCountries(["NZ", "AU"]);
    assert.equal(countries.length, 2);
    const codes = countries.map((c) => c.code);
    assert.ok(codes.includes("NZ"));
    assert.ok(codes.includes("AU"));
  });

  it("batch updates countries (full replace)", async () => {
    const countries = await batchGetCountries(["NZ", "AU"]);
    const nz = countries.find((country) => country.code === "NZ");
    const au = countries.find((country) => country.code === "AU");
    assert.ok(nz);
    assert.ok(au);

    const inputs: CountryUpdateRequestDto[] = [
      { code: "NZ", name: nz.name, currencyCode: nz.currencyCode, status: "INACTIVE" },
      { code: "AU", name: au.name, currencyCode: au.currencyCode, status: "INACTIVE" },
    ];
    const results = await batchUpdateCountries(inputs);

    assert.equal(results.length, 2);
    assert.ok(results.every((c) => c.status === "INACTIVE"));

    // restore
    await batchUpdateCountries([
      { code: "NZ", name: nz.name, currencyCode: nz.currencyCode, status: "ACTIVE" },
      { code: "AU", name: au.name, currencyCode: au.currencyCode, status: "ACTIVE" },
    ]);
  });

  it("batch patches countries (partial update)", async () => {
    const inputs: Array<CountryPatchRequestDto & { code: string }> = [
      { code: "NZ", status: "INACTIVE" },
      { code: "AU", status: "INACTIVE" },
    ];
    const results = await batchPatchCountries(inputs);

    assert.equal(results.length, 2);
    assert.ok(results.every((c) => c.status === "INACTIVE"));

    // restore
    await batchPatchCountries([{ code: "NZ", status: "ACTIVE" }, { code: "AU", status: "ACTIVE" }]);
  });
});
