import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Deactivate, Delete } from "../../../modules/countries/domain/operation-policy";

describe("country operation policy", () => {
  it("blocks lifecycle operations when a company references the country", () => {
    const state = { code: "NZ", linkedBy: [{ type: "Companies", code: "SAMP-NZ" }] };
    assert.equal(Deactivate(state)[0]?.code, "LINKED_RECORD_CANNOT_BE_DEACTIVATED");
    assert.equal(Delete(state)[0]?.code, "LINKED_RECORD_CANNOT_BE_DELETED");
  });
});
