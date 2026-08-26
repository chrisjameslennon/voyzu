import type { UserCreateRequestDto } from "@voyzu/auth/types";
import { randomUUID } from "node:crypto";
import type { Filter, ListOptions } from "@voyzu/types/params";
import type { UserBatchPatchRequestDto, UserBatchUpdateRequestDto, UserPatchRequestDto } from "@voyzu/auth/types";
import type { UserPasswordUpdateRequestDto } from "@voyzu/auth/types";
import type { UserProfileUpdateRequestDto } from "@voyzu/auth/types";
import type { UserUpdateRequestDto } from "@voyzu/auth/types";
import type { UserResponseDto } from "@voyzu/auth/types";
import { getDb, withTransaction, type DbExecutor } from "@voyzu/capability/db";
import { BusinessRuleError, ConflictError, DataError, NotFoundError, InputValidationError } from "@voyzu/capability/errors";
import { UserRepo } from "../db/user.repo";
import type { UserRow } from "../db/user.row.types";
import { getCurrentActorType, getCurrentUser } from "./current-user.service";
import { hashPassword } from "./password-hash";
import { toDto } from "./user.mapper";
import { validateUserInput, validateUserPassword } from "./user.validator";
import type { UserAuditStamp } from "../db/user.repo";

function auditStamp(user: UserResponseDto): UserAuditStamp {
  return {
    actorType: getCurrentActorType(),
    userId: user.id,
    mutationId: randomUUID(),
  };
}

async function getAuditActor(
  repo: UserRepo,
  userId: string | null,
): Promise<UserResponseDto["audit"]["created"]["user"]> {
  if (!userId) return null;
  const parsed = Number(userId);
  if (!Number.isInteger(parsed)) return null;
  const row = await repo.getById(parsed);
  return row
    ? {
        id: row.id,
        code: row.code,
        displayName: row.display_name,
      }
    : null;
}

async function getAuditActors(
  row: UserRow,
  repo: UserRepo,
): Promise<{ creationUser: UserResponseDto["audit"]["created"]["user"]; updatedUser: UserResponseDto["audit"]["updated"]["user"] }> {
  const [creationUser, updatedUser] = await Promise.all([
    getAuditActor(repo, row.creation_user_id),
    getAuditActor(repo, row.updated_user_id),
  ]);
  return { creationUser, updatedUser };
}

async function enrich(row: Awaited<ReturnType<UserRepo["get"]>>): Promise<UserResponseDto | null> {
  if (!row) return null;
  const repo = new UserRepo(getDb());
  return toDto(row, await getAuditActors(row, repo));
}

export async function listUsers(): Promise<UserResponseDto[]> {
  const repo = new UserRepo(getDb());
  const rows = await repo.list();
  return Promise.all(rows.map(async (row) => toDto(row, await getAuditActors(row, repo))));
}

export async function filterUsers(filters: Filter[], _options?: ListOptions): Promise<UserResponseDto[]> {
  const users = await listUsers();
  return users.filter((user) => filters.every((filter) => {
    const value = (user as unknown as Record<string, unknown>)[filter.field];
    switch (filter.operator) {
      case "=": return value === filter.value;
      case "!=": return value !== filter.value;
      case "IN": return Array.isArray(filter.value) && filter.value.some((candidate) => candidate === value);
      case "NOT IN": return Array.isArray(filter.value) && !filter.value.some((candidate) => candidate === value);
      case "LIKE":
      case "ILIKE": return String(value ?? "").toLowerCase().includes(String(filter.value ?? "").replaceAll("%", "").toLowerCase());
      default: return true;
    }
  }));
}

export async function searchUsers(phrase: string, _options?: ListOptions): Promise<UserResponseDto[]> {
  const needle = phrase.toLowerCase();
  return (await listUsers()).filter((user) =>
    user.code.toLowerCase().includes(needle) ||
    user.displayName.toLowerCase().includes(needle) ||
    (user.email ?? "").toLowerCase().includes(needle) ||
    user.role.toLowerCase().includes(needle) ||
    user.status.toLowerCase().includes(needle),
  );
}

export async function getUser(code: string): Promise<UserResponseDto | null> {
  return enrich(await new UserRepo(getDb()).get(code));
}

export async function updateCurrentUserProfile(input: UserProfileUpdateRequestDto): Promise<UserResponseDto> {
  const currentUser = await requireCurrentUser();
  const normalized = normalizeProfileUpdate(input);

  try {
    return await withTransaction(async (db) => {
      const repo = new UserRepo(db);
      const row = await repo.update(currentUser.code, {
        code: currentUser.code,
        email: normalized.email ?? null,
        display_name: normalized.displayName,
        role: currentUser.role,
        access_mode: currentUser.accessMode,
        implementer_access: currentUser.implementerAccess,
        status: currentUser.status,
        audit: auditStamp(currentUser),
      });
      const user = toDto(row, await getAuditActors(row, repo));
      return user;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A user with this email already exists");
    }
    if (err instanceof DataError) throw new NotFoundError(`User ${currentUser.code} not found`);
    throw err;
  }
}

export async function changeCurrentUserPassword(input: UserPasswordUpdateRequestDto): Promise<void> {
  const currentUser = await requireCurrentUser();
  const errors = validateUserPassword(input, currentUser.accessMode);
  if (errors.length) throw new InputValidationError(errors.join("; "));

  try {
    await withTransaction(async (db) => {
      const repo = new UserRepo(db);
      await repo.updatePassword(currentUser.code, await hashPassword(input.password), auditStamp(currentUser));
    });
  } catch (err) {
    if (err instanceof DataError) throw new NotFoundError(`User ${currentUser.code} not found`);
    throw err;
  }
}

export async function createUser(input: UserCreateRequestDto): Promise<UserResponseDto> {
  const currentUser = await requireCurrentAdmin();
  const normalized = normalizeCreate(input);
  const errors = [...validateUserInput(normalized), ...validateUserPassword(normalized, normalized.accessMode)];
  if (errors.length) throw new InputValidationError(errors.join("; "));
  const passwordHash = await hashPassword(normalized.password);

  try {
    return await withTransaction(async (client) => {
      const repo = new UserRepo(client);
      const row = await repo.insert({
        code: normalized.code,
        email: normalized.email ?? null,
        display_name: normalized.displayName,
        password_hash: passwordHash,
        role: normalized.role,
        access_mode: normalized.accessMode,
        implementer_access: normalized.implementerAccess === true,
        status: normalized.status ?? "ACTIVE",
        audit: auditStamp(currentUser),
      });
      const user = toDto(row, await getAuditActors(row, repo));
      return user;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A user with this code or email already exists");
    }
    throw err;
  }
}

export async function changeUserPassword(code: string, input: UserPasswordUpdateRequestDto): Promise<void> {
  const currentUser = await requireCurrentAdmin();
  const existing = await new UserRepo(getDb()).get(code);
  if (!existing) throw new NotFoundError(`User ${code} not found`);
  const errors = validateUserPassword(input, existing.access_mode);
  if (errors.length) throw new InputValidationError(errors.join("; "));

  try {
    await withTransaction(async (db) => {
      const repo = new UserRepo(db);
      await repo.updatePassword(code, await hashPassword(input.password), auditStamp(currentUser));
    });
  } catch (err) {
    if (err instanceof DataError) throw new NotFoundError(`User ${code} not found`);
    throw err;
  }
}

export async function updateUser(code: string, input: UserUpdateRequestDto): Promise<UserResponseDto> {
  const currentUser = await requireCurrentAdmin();

  try {
    return await withTransaction(async (client) => {
      const repo = new UserRepo(client);
      const user = await updateUserWithRepo(repo, currentUser, code, input);
      return user;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A user with this code or email already exists");
    }
    if (err instanceof DataError) throw new NotFoundError(`User ${code} not found`);
    throw err;
  }
}

export async function patchUser(code: string, input: UserPatchRequestDto): Promise<UserResponseDto> {
  const existing = await getUser(code);
  if (!existing) throw new NotFoundError(`User ${code} not found`);
  return updateUser(code, {
    code: existing.code,
    email: input.email !== undefined ? input.email : existing.email,
    displayName: input.displayName ?? existing.displayName,
    role: input.role ?? existing.role,
    accessMode: input.accessMode ?? existing.accessMode,
    implementerAccess: input.implementerAccess ?? existing.implementerAccess,
    status: existing.status,
  });
}

export async function deleteUser(code: string): Promise<void> {
  const currentUser = await requireCurrentAdmin();
  const normalizedCode = code.trim().toUpperCase();
  if (normalizedCode === currentUser.code) throw new BusinessRuleError("You cannot delete your own user");

  await withTransaction(async (db) => {
    const repo = new UserRepo(db);
    const [row] = await ensureUsersExist([normalizedCode], repo);
    await ensureAtLeastOneActiveAdminAfterMutation(repo, [row]);
    await repo.delete(normalizedCode);
  });
}

export async function batchGetUsers(codes: string[]): Promise<UserResponseDto[]> {
  const repo = new UserRepo(getDb());
  const rows = await repo.batchGet(normalizeCodes(codes));
  return Promise.all(rows.map(async (row) => toDto(row, await getAuditActors(row, repo))));
}

export async function batchCreateUsers(inputs: UserCreateRequestDto[]): Promise<UserResponseDto[]> {
  const currentUser = await requireCurrentAdmin();
  try {
    return await withTransaction(async (db) => {
      const repo = new UserRepo(db);
      const users: UserResponseDto[] = [];
      for (const input of inputs) {
        const normalized = normalizeCreate(input);
        const errors = [...validateUserInput(normalized), ...validateUserPassword(normalized, normalized.accessMode)];
        if (errors.length) throw new InputValidationError(errors.join("; "));
        const row = await repo.insert({
          code: normalized.code,
          email: normalized.email ?? null,
          display_name: normalized.displayName,
          password_hash: await hashPassword(normalized.password),
          role: normalized.role,
          access_mode: normalized.accessMode,
          implementer_access: normalized.implementerAccess === true,
          status: normalized.status ?? "ACTIVE",
          audit: auditStamp(currentUser),
        });
        users.push(toDto(row, await getAuditActors(row, repo)));
      }
      return users;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more user codes or emails already exist");
    }
    throw err;
  }
}

export async function batchUpdateUsers(inputs: UserBatchUpdateRequestDto[]): Promise<UserResponseDto[]> {
  const currentUser = await requireCurrentAdmin();
  try {
    return await withTransaction(async (db) => {
      const repo = new UserRepo(db);
      const users: UserResponseDto[] = [];
      for (const input of inputs) {
        users.push(await updateUserWithRepo(repo, currentUser, input.code, input));
      }
      return users;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more user codes or emails already exist");
    }
    if (err instanceof DataError) throw new NotFoundError("One or more users not found");
    throw err;
  }
}

export async function batchPatchUsers(inputs: UserBatchPatchRequestDto[]): Promise<UserResponseDto[]> {
  const currentUser = await requireCurrentAdmin();
  try {
    return await withTransaction(async (db) => {
      const repo = new UserRepo(db);
      const users: UserResponseDto[] = [];
      for (const input of inputs) {
        const existingRow = await repo.get(input.code);
        if (!existingRow) throw new DataError(`User ${input.code} not found`);
        const existing = toDto(existingRow, await getAuditActors(existingRow, repo));
        users.push(await updateUserWithRepo(repo, currentUser, input.code, {
          code: existing.code,
          email: input.email !== undefined ? input.email : existing.email,
          displayName: input.displayName ?? existing.displayName,
          role: input.role ?? existing.role,
          accessMode: input.accessMode ?? existing.accessMode,
          implementerAccess: input.implementerAccess ?? existing.implementerAccess,
          status: existing.status,
        }));
      }
      return users;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more user codes or emails already exist");
    }
    if (err instanceof DataError) throw new NotFoundError("One or more users not found");
    throw err;
  }
}

export async function activateUser(code: string): Promise<UserResponseDto> {
  const currentUser = await requireCurrentAdmin();
  return withTransaction(async (db) => {
    const [user] = await transitionUserStatus(db, currentUser, [code], "ACTIVE");
    return user;
  });
}

export async function deactivateUser(code: string): Promise<UserResponseDto> {
  const currentUser = await requireCurrentAdmin();
  return withTransaction(async (db) => {
    const [user] = await transitionUserStatus(db, currentUser, [code], "INACTIVE");
    return user;
  });
}

export async function batchDeleteUsers(codes: string[]): Promise<void> {
  const currentUser = await requireCurrentAdmin();
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.includes(currentUser.code)) throw new BusinessRuleError("You cannot delete your own user");

  await withTransaction(async (db) => {
    const repo = new UserRepo(db);
    const rows = await ensureUsersExist(normalizedCodes, repo);
    await ensureAtLeastOneActiveAdminAfterMutation(repo, rows);
    await repo.batchDelete(normalizedCodes);
  });
}

export async function activateUsers(codes: string[]): Promise<UserResponseDto[]> {
  const currentUser = await requireCurrentAdmin();
  return withTransaction(async (db) => {
    const users = await transitionUserStatus(db, currentUser, codes, "ACTIVE");
    return users;
  });
}

export async function deactivateUsers(codes: string[]): Promise<UserResponseDto[]> {
  const currentUser = await requireCurrentAdmin();
  return withTransaction(async (db) => {
    const users = await transitionUserStatus(db, currentUser, codes, "INACTIVE");
    return users;
  });
}

async function transitionUserStatus(
  db: DbExecutor,
  currentUser: UserResponseDto,
  codes: string[],
  targetStatus: "ACTIVE" | "INACTIVE",
): Promise<UserResponseDto[]> {
  const normalizedCodes = normalizeCodes(codes);

  const repo = new UserRepo(db);
  const users = await ensureUsersExist(normalizedCodes, repo);
  if (targetStatus !== "ACTIVE") await ensureAtLeastOneActiveAdminAfterMutation(repo, users);
  const updated = await repo.batchUpdateStatus(normalizedCodes, targetStatus, auditStamp(currentUser));
  return Promise.all(updated.map(async (row) => toDto(row, await getAuditActors(row, repo))));
}

async function updateUserWithRepo(
  repo: UserRepo,
  currentUser: UserResponseDto,
  code: string,
  input: UserUpdateRequestDto,
): Promise<UserResponseDto> {
  const normalized = normalizeUpdate(input);
  const errors = validateUserInput(normalized);
  if (errors.length) throw new InputValidationError(errors.join("; "));

  const existing = await repo.get(code);
  if (!existing) throw new DataError(`User ${code} not found`);
  if (existing.code === currentUser.code && existing.role !== normalized.role) {
    throw new BusinessRuleError("You cannot change your own access level");
  }
  await ensureAtLeastOneActiveAdminAfterMutation(repo, [existing], normalized.role, normalized.status);
  const row = await repo.update(code, {
    code: normalized.code,
    email: normalized.email ?? null,
    display_name: normalized.displayName,
    role: normalized.role,
    access_mode: normalized.accessMode,
    implementer_access: normalized.implementerAccess === true,
    status: normalized.status,
    audit: auditStamp(currentUser),
  });
  return toDto(row, await getAuditActors(row, repo));
}

async function requireCurrentAdmin(): Promise<UserResponseDto> {
  const currentUser = await requireCurrentUser();
  if (!currentUser || currentUser.status !== "ACTIVE" || currentUser.role !== "ADMIN") {
    throw new BusinessRuleError("Only admin users can manage users");
  }
  return currentUser;
}

async function requireCurrentUser(): Promise<UserResponseDto> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.status !== "ACTIVE") {
    throw new BusinessRuleError("A signed-in active user is required");
  }
  return currentUser;
}

async function ensureAtLeastOneActiveAdminAfterMutation(
  repo: UserRepo,
  affectedUsers: UserRow[],
  replacementRole?: string,
  replacementStatus?: string,
): Promise<void> {
  const activeAdminCount = await repo.countActiveAdmins();
  const activeAdminsRemoved = affectedUsers.filter((user) => user.role === "ADMIN" && user.status === "ACTIVE").length;
  const activeAdminsAdded =
    affectedUsers.length === 1 && replacementRole === "ADMIN" && replacementStatus === "ACTIVE" ? 1 : 0;

  if (activeAdminCount - activeAdminsRemoved + activeAdminsAdded < 1) {
    throw new BusinessRuleError("There must be at least one active admin user");
  }
}

async function ensureUsersExist(codes: string[], repo: UserRepo): Promise<UserRow[]> {
  const rows = await repo.batchGet(codes);
  const found = new Set(rows.map((row) => row.code));
  const missing = codes.filter((code) => !found.has(code));
  if (missing.length > 0) throw new NotFoundError(`User ${missing.join(", ")} not found`);
  return rows;
}

function normalizeCodes(codes: string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

function normalizeCreate(input: UserCreateRequestDto): UserCreateRequestDto {
  return {
    ...input,
    code: input.code?.trim().toUpperCase(),
    email: input.email ? input.email.trim() : null,
    displayName: input.displayName?.trim(),
    password: input.password ?? "",
    confirmPassword: input.confirmPassword ?? "",
    status: input.status ?? "ACTIVE",
    implementerAccess: input.implementerAccess === true,
  };
}

function normalizeUpdate(input: UserUpdateRequestDto): UserUpdateRequestDto {
  return {
    ...input,
    code: input.code?.trim().toUpperCase(),
    email: input.email ? input.email.trim() : null,
    displayName: input.displayName?.trim(),
    implementerAccess: input.implementerAccess === true,
  };
}

function normalizeProfileUpdate(input: UserProfileUpdateRequestDto): UserProfileUpdateRequestDto {
  return {
    email: input.email ? input.email.trim() : null,
    displayName: input.displayName?.trim(),
  };
}
