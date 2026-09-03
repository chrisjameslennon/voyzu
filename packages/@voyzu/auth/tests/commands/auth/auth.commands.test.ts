import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { authenticateUser } from "@voyzu/auth/auth/commands";
import { createUser, getUser } from "@voyzu/auth/users/commands";
import { getDb, getPool } from "@voyzu/capability/db";
import { runWithCurrentUserContext } from "../../../modules/users/server/lib/current-user-context";

const code = `OPTEST${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase();
const password = "authenticate-command-password";

before(async () => {
  const admin = await getUser("ADMIN");
  assert.ok(admin, "The seeded ADMIN user is required for authentication command tests");
  await runWithCurrentUserContext(admin, () => createUser({
    code,
    email: null,
    displayName: "Authentication command test",
    password,
    confirmPassword: password,
    role: "STANDARD",
    accessMode: "UI",
    status: "ACTIVE",
  }));
});

after(async () => {
  await getDb().query("DELETE FROM app_user WHERE code = $1", [code]);
  await getPool().end();
});

test("authenticateUser authenticates a user through the public command", async () => {
  const authenticated = await authenticateUser(code.toLowerCase(), password);
  assert.equal(authenticated.code, code);
  assert.equal(authenticated.displayName, "Authentication command test");
});
