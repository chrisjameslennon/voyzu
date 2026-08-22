import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Deactivate, Delete } from "../../../modules/currencies/domain/operation-policy";

describe("currency operation policy", () => {
  it("blocks lifecycle operations when a country or company references the currency", () => {
    const state = { code: "NZD", linkedBy: [{ type: "Countries", code: "NZ" }] };
    assert.equal(Deactivate(state)[0]?.code, "LINKED_RECORD_CANNOT_BE_DEACTIVATED");
    assert.equal(Delete(state)[0]?.code, "LINKED_RECORD_CANNOT_BE_DELETED");
  });
});
