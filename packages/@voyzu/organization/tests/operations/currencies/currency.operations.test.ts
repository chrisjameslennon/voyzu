import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";

import type { CurrencyCreateRequestDto } from "@voyzu/organization/types/modules/currencies/currency.create.request.dto";
import type { CurrencyPatchRequestDto } from "@voyzu/organization/types/modules/currencies/currency.patch.request.dto";
import type { CurrencyResponseDto } from "@voyzu/organization/types/modules/currencies/currency.response.dto";
import type { CurrencyUpdateRequestDto } from "@voyzu/organization/types/modules/currencies/currency.update.request.dto";

import { getPool } from "@voyzu/capability/db";
import {
  getCurrency,
  createCurrency,
  updateCurrency,
  patchCurrency,
  deleteCurrency,
  listCurrencies,
  filterCurrencies,
  searchCurrencies,
  batchCreateCurrencies,
  batchGetCurrencies,
  batchUpdateCurrencies,
  batchPatchCurrencies,
  batchDeleteCurrencies
} from "../../../modules/currencies/operations";

const createdCodes: string[] = [];
const testCodes = ["SVA", "SVB", "ZZC", "ZZD"];

before(async () => {
  await batchDeleteCurrencies(testCodes);
});

after(async () => {
  if (createdCodes.length) {
    try {
      await batchDeleteCurrencies([...createdCodes]);
    } catch {
      // best-effort cleanup
    }
  }
  await getPool().end();
});

describe("currency.service", () => {
  it("creates a currency (minimal fields)", async () => {
    const input: CurrencyCreateRequestDto = {
      code: "SVA",
      name: "Service Test Currency 1",
    };
    const currency: CurrencyResponseDto = await createCurrency(input);
    createdCodes.push(currency.code);

    assert.equal(currency.code, "SVA");
    assert.equal(currency.name, "Service Test Currency 1");
    assert.equal(currency.status, "ACTIVE");
    assert.equal(currency.symbol, undefined);
    assert.ok(currency.audit.created.date);
    assert.ok(currency.audit.updated.date);
  });

  it("creates a currency with optional fields", async () => {
    const input: CurrencyCreateRequestDto = {
      code: "SVB",
      name: "Service Test Currency 2",
      symbol: "T$",
    };
    const currency: CurrencyResponseDto = await createCurrency(input);
    createdCodes.push(currency.code);

    assert.equal(currency.code, "SVB");
    assert.equal(currency.symbol, "T$");
  });

  it("gets a currency by code", async () => {
    const currency = await getCurrency("SVA");
    assert.ok(currency);
    assert.equal(currency.code, "SVA");
    assert.equal(currency.name, "Service Test Currency 1");
  });

  it("returns null for non-existent code", async () => {
    const currency = await getCurrency("ZZZZZ");
    assert.equal(currency, null);
  });

  it("updates a currency by code (full replace)", async () => {
    const input: CurrencyUpdateRequestDto = {
      code: "SVA",
      name: "Service Test Currency 1 Updated",
      status: "INACTIVE",
    };
    const currency = await updateCurrency("SVA", input);

    assert.equal(currency.name, "Service Test Currency 1 Updated");
    assert.equal(currency.status, "INACTIVE");
    assert.equal(currency.symbol, undefined);
  });

  it("patches a currency (partial update — status only)", async () => {
    const result = await patchCurrency("SVA", { status: "ACTIVE" });
    assert.equal(result.status, "ACTIVE");
  });

  it("lists all currencies (includes test currencies)", async () => {
    const currencies: CurrencyResponseDto[] = await listCurrencies();
    assert.ok(currencies.length > 0);
    const testCodes = currencies.map((c) => c.code).filter((c) => ["SVA", "SVB"].includes(c));
    assert.ok(testCodes.includes("SVA"));
    assert.ok(testCodes.includes("SVB"));
  });

  it("filters currencies by status", async () => {
    const currencies = await filterCurrencies([{ field: "status", operator: "=", value: "ACTIVE" }]);
    assert.ok(currencies.length > 0);
    assert.ok(currencies.every((c) => c.status === "ACTIVE"));
  });

  it("searches currencies by phrase", async () => {
    const currencies = await searchCurrencies("Service Test Currency 1");
    const found = currencies.find((c) => c.code === "SVA");
    assert.ok(found);
  });
  it("batch creates currencies", async () => {
    const inputs: CurrencyCreateRequestDto[] = [
      { code: "ZZC", name: "Service Test Currency 3" },
      { code: "ZZD", name: "Service Test Currency 4" },
    ];
    const currencies = await batchCreateCurrencies(inputs);
    for (const c of currencies) createdCodes.push(c.code);

    assert.equal(currencies.length, 2);
    assert.equal(currencies[0].code, "ZZC");
    assert.equal(currencies[1].code, "ZZD");
  });

  it("batch gets currencies by codes", async () => {
    const currencies = await batchGetCurrencies(["SVA", "SVB"]);
    assert.equal(currencies.length, 2);
    const codes = currencies.map((c) => c.code);
    assert.ok(codes.includes("SVA"));
    assert.ok(codes.includes("SVB"));
  });

  it("batch updates currencies (full replace)", async () => {
    const inputs: CurrencyUpdateRequestDto[] = [
      { code: "ZZC", name: "Service Test Currency 3 Updated", status: "INACTIVE" },
      { code: "ZZD", name: "Service Test Currency 4 Updated", status: "INACTIVE" },
    ];
    const currencies = await batchUpdateCurrencies(inputs);

    assert.equal(currencies.length, 2);
    assert.equal(currencies[0].name, "Service Test Currency 3 Updated");
    assert.equal(currencies[0].status, "INACTIVE");
    assert.equal(currencies[1].name, "Service Test Currency 4 Updated");
    assert.equal(currencies[1].status, "INACTIVE");
  });

  it("batch patches currencies (partial update)", async () => {
    const inputs: Array<CurrencyPatchRequestDto & { code: string }> = [
      { code: "ZZC", status: "ACTIVE" },
      { code: "ZZD", status: "ACTIVE" },
    ];
    const currencies = await batchPatchCurrencies(inputs);

    assert.equal(currencies.length, 2);
    assert.equal(currencies[0].status, "ACTIVE");
    assert.equal(currencies[1].status, "ACTIVE");
  });

  it("deletes a single currency by code", async () => {
    const code = createdCodes.shift()!;
    await deleteCurrency(code);

    const currency = await getCurrency(code);
    assert.equal(currency, null);
  });

  it("batch deletes remaining currencies", async () => {
    await batchDeleteCurrencies([...createdCodes]);

    for (const code of createdCodes) {
      const currency = await getCurrency(code);
      assert.equal(currency, null);
    }

    createdCodes.length = 0;
  });

  it("validates required fields on create", async () => {
    await assert.rejects(
      () => createCurrency({ code: "", name: "" }),
      (err: Error) => {
        assert.ok(err.message.includes("Code is required"));
        assert.ok(err.message.includes("Name is required"));
        return true;
      },
    );
  });

  it("validates invalid status on patch", async () => {
    await assert.rejects(
      () => patchCurrency("NZD", { status: "INVALID" as never }),
      (err: Error) => {
        assert.ok(err.message.includes("Status must be"));
        return true;
      },
    );
  });
});

