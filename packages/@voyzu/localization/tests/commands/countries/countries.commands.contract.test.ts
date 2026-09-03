import assert from "node:assert/strict";
import { test } from "node:test";

import { commands } from "../../../modules/countries/commands";

test("countries exports callable commands", () => {
  assert.ok(Object.keys(commands).length > 0);
  for (const [name, command] of Object.entries(commands)) {
    assert.equal(typeof command, "function", `countries.${name} must be callable`);
  }
});
