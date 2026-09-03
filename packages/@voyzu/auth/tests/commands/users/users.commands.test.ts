import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { getDb, getPool } from "@voyzu/capability/db";
import type { UserCreateRequestDto, UserResponseDto } from "@voyzu/auth/types";
import {
  activateUser,
  activateUsers,
  batchCreateUsers,
  batchDeleteUsers,
  batchGetUsers,
  batchPatchUsers,
  batchUpdateUsers,
  changeCurrentUserPassword,
  changeUserPassword,
  createUser,
  currentUserCanManageUsers,
  deactivateUser,
  deactivateUsers,
  deleteUser,
  filterUsers,
  getCurrentUser,
  getUser,
  listUsers,
  patchUser,
  searchUsers,
  updateCurrentUserProfile,
  updateUser,
} from "@voyzu/auth/users/commands";
import { getCurrentActorType } from "@voyzu/auth/users/server";
import { runWithCurrentUserContext } from "../../../modules/users/server/lib/current-user-context";

const TEST_PREFIX = "OPTEST";
const PASSWORD = "command-test-password";
let admin: UserResponseDto;

function uniqueCode(): string {
  return `${TEST_PREFIX}${randomUUID().replaceAll("-", "").slice(0, 8)}`.toUpperCase();
}

function input(code = uniqueCode(), overrides: Partial<UserCreateRequestDto> = {}): UserCreateRequestDto {
  return {
    code,
    email: null,
    displayName: `Command test ${code}`,
    password: PASSWORD,
    confirmPassword: PASSWORD,
    role: "STANDARD",
    accessMode: "UI",
    implementerAccess: false,
    status: "ACTIVE",
    ...overrides,
  };
}

function asUser<T>(user: UserResponseDto, callback: () => Promise<T>, actorType: "APP" | "API" = "APP"): Promise<T> {
  return runWithCurrentUserContext(user, callback, actorType);
}

function asAdmin<T>(callback: () => Promise<T>): Promise<T> {
  return asUser(admin, callback);
}

async function create(overrides: Partial<UserCreateRequestDto> = {}): Promise<UserResponseDto> {
  return asAdmin(() => createUser(input(uniqueCode(), overrides)));
}

async function cleanTestUsers(): Promise<void> {
  await getDb().query("DELETE FROM app_user WHERE code LIKE $1", [`${TEST_PREFIX}%`]);
}

before(async () => {
  await cleanTestUsers();
  const seededAdmin = await getUser("ADMIN");
  assert.ok(seededAdmin, "The seeded ADMIN user is required for user command tests");
  admin = seededAdmin;
});

after(async () => {
  await cleanTestUsers();
  await getPool().end();
});

test("listUsers, filterUsers, searchUsers, and getUser expose user reads", async () => {
  const created = await create();
  assert.ok((await listUsers()).some(({ code }) => code === created.code));
  assert.deepEqual((await filterUsers([{ field: "code", operator: "=", value: created.code }])).map(({ code }) => code), [created.code]);
  assert.ok((await searchUsers(created.code.toLowerCase())).some(({ code }) => code === created.code));
  assert.equal((await getUser(created.code))?.id, created.id);
});

test("current-user commands use the external caller context", async () => {
  const created = await create();
  await asUser(created, async () => {
    assert.equal((await getCurrentUser())?.code, created.code);
    assert.equal(await currentUserCanManageUsers(), false);
    assert.equal(getCurrentActorType(), "API");
    const updated = await updateCurrentUserProfile({ displayName: "Updated by command", email: null });
    assert.equal(updated.displayName, "Updated by command");
    await changeCurrentUserPassword({ password: `${PASSWORD}-changed`, confirmPassword: `${PASSWORD}-changed` });
  }, "API");
  assert.equal(await asUser(created, async () => getCurrentActorType(), "API"), "API");
  assert.equal(await asAdmin(() => currentUserCanManageUsers()), true);
});

test("createUser, updateUser, and patchUser mutate through commands", async () => {
  const created = await create({ role: "STANDARD" });
  const updated = await asAdmin(() => updateUser(created.code, {
    code: created.code,
    email: null,
    displayName: "Fully updated",
    role: "STANDARD",
    accessMode: "UI_AND_API",
    implementerAccess: false,
    status: "ACTIVE",
  }));
  assert.equal(updated.displayName, "Fully updated");
  assert.equal(updated.accessMode, "UI_AND_API");

  const patched = await asAdmin(() => patchUser(created.code, { displayName: "Partially updated" }));
  assert.equal(patched.displayName, "Partially updated");
});

test("changeUserPassword, activateUser, deactivateUser, and deleteUser expose single-record commands", async () => {
  const created = await create();
  await asAdmin(() => changeUserPassword(created.code, { password: `${PASSWORD}-admin`, confirmPassword: `${PASSWORD}-admin` }));
  assert.equal((await asAdmin(() => deactivateUser(created.code))).status, "INACTIVE");
  assert.equal((await asAdmin(() => activateUser(created.code))).status, "ACTIVE");
  await asAdmin(() => deleteUser(created.code));
  assert.equal(await getUser(created.code), null);
});

test("batchCreateUsers, batchGetUsers, batchUpdateUsers, and batchPatchUsers expose batch writes", async () => {
  const first = input();
  const second = input();
  const created = await asAdmin(() => batchCreateUsers([first, second]));
  assert.deepEqual(new Set(created.map(({ code }) => code)), new Set([first.code, second.code]));
  assert.equal((await batchGetUsers([first.code, second.code])).length, 2);

  const updated = await asAdmin(() => batchUpdateUsers(created.map((user, index) => ({
    code: user.code,
    email: null,
    displayName: `Batch updated ${index}`,
    role: user.role,
    accessMode: user.accessMode,
    implementerAccess: user.implementerAccess,
    status: user.status,
  }))));
  assert.deepEqual(updated.map(({ displayName }) => displayName), ["Batch updated 0", "Batch updated 1"]);

  const patched = await asAdmin(() => batchPatchUsers(created.map(({ code }, index) => ({
    code,
    displayName: `Batch patched ${index}`,
  }))));
  assert.deepEqual(patched.map(({ displayName }) => displayName), ["Batch patched 0", "Batch patched 1"]);
});

test("activateUsers, deactivateUsers, and batchDeleteUsers expose batch state commands", async () => {
  const users = await asAdmin(() => batchCreateUsers([input(), input()]));
  const codes = users.map(({ code }) => code);
  assert.ok((await asAdmin(() => deactivateUsers(codes))).every(({ status }) => status === "INACTIVE"));
  assert.ok((await asAdmin(() => activateUsers(codes))).every(({ status }) => status === "ACTIVE"));
  await asAdmin(() => batchDeleteUsers(codes));
  assert.equal((await batchGetUsers(codes)).length, 0);
});
