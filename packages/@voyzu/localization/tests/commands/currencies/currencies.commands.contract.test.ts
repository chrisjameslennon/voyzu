import assert from "node:assert/strict";
import { test } from "node:test";

import { commands } from "../../../modules/currencies/commands";

test("currencies exports callable commands", () => {
  assert.ok(Object.keys(commands).length > 0);
  for (const [name, command] of Object.entries(commands)) {
    assert.equal(typeof command, "function", `currencies.${name} must be callable`);
  }
});
