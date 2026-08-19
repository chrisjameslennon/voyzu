import type { NextRequest } from "next/server";

import type { CodesRequestDto, FilterRequestDto } from "@voyzu/types/params";
import type { UserCreateRequestDto } from "@voyzu/auth/types";
import type { UserPasswordUpdateRequestDto } from "@voyzu/auth/types";
import type { UserProfileUpdateRequestDto } from "@voyzu/auth/types";
import type { UserUpdateRequestDto } from "@voyzu/auth/types";
import type { UserCompanyAccessUpdateRequestDto } from "@voyzu/auth/types";
import type { UserBatchPatchRequestDto, UserBatchUpdateRequestDto, UserPatchRequestDto } from "@voyzu/auth/types";
import { businessRuleError, conflictError, forbiddenError, notFoundError, serverError, inputValidationError, unauthorizedError } from "@voyzu/capability/http";
import { created, noContent, ok } from "@voyzu/capability/http";
import { parseBody } from "@voyzu/capability/http";
import { BusinessRuleError, ConflictError, NotFoundError, InputValidationError } from "@voyzu/capability/errors";
import { currentUserCanManageUsers } from "../lib/current-user.service";
import { activateUser, activateUsers, batchCreateUsers, batchDeleteUsers, batchGetUsers, batchPatchUsers, batchUpdateUsers, changeCurrentUserPassword, changeUserPassword, createUser, deactivateUser, deactivateUsers, deleteUser, filterUsers, getUser, listUsers, patchUser, replaceUserCompanyAccess, searchUsers, updateCurrentUserProfile, updateUser } from "../lib/user.service";
import { getCurrentUser } from "../lib/current-user.service";

async function requireAdmin() {
  if (!(await currentUserCanManageUsers())) {
    return forbiddenError("You do not have access");
  }
  return null;
}

export async function handleList(_req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok(await listUsers());
  } catch (err) {
    return serverError(err);
  }
}

export async function handleCreate(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return created(await createUser(await parseBody<UserCreateRequestDto>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}

export async function handleGet(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    const user = await getUser(decodeURIComponent(code));
    if (!user) return notFoundError(`User ${code} not found`);
    return ok(user);
  } catch (err) {
    return serverError(err);
  }
}

export async function handleUpdate(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    return ok(await updateUser(decodeURIComponent(code), await parseBody<UserUpdateRequestDto>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleCurrentProfile(_req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError("You do not have access");
    const user = await getUser(currentUser.code);
    return ok(user ?? currentUser);
  } catch (err) {
    return serverError(err);
  }
}

export async function handleUpdateCurrentProfile(req: NextRequest) {
  try {
    return ok(await updateCurrentUserProfile(await parseBody<UserProfileUpdateRequestDto>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleChangeCurrentPassword(req: NextRequest) {
  try {
    await changeCurrentUserPassword(await parseBody<UserPasswordUpdateRequestDto>(req));
    return noContent();
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleChangePassword(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    await changeUserPassword(decodeURIComponent(code), await parseBody<UserPasswordUpdateRequestDto>(req));
    return noContent();
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleDelete(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    await deleteUser(decodeURIComponent(code));
    return noContent();
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDelete(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await parseBody<CodesRequestDto>(req);
    await batchDeleteUsers(body.codes ?? []);
    return noContent();
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchActivate(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await parseBody<CodesRequestDto>(req);
    return ok(await activateUsers(body.codes ?? []));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDeactivate(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await parseBody<CodesRequestDto>(req);
    return ok(await deactivateUsers(body.codes ?? []));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleReplaceCompanyAccess(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    const body = await parseBody<UserCompanyAccessUpdateRequestDto>(req);
    return ok(await replaceUserCompanyAccess(decodeURIComponent(code), body.companyIds ?? []));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleFilter(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { filters, options } = await parseBody<FilterRequestDto>(req);
    return ok(await filterUsers(filters ?? [], options));
  } catch (err) {
    return serverError(err);
  }
}

export async function handleSearch(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok(await searchUsers(req.nextUrl.searchParams.get("q")!));
  } catch (err) {
    return serverError(err);
  }
}

export async function handlePatch(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    return ok(await patchUser(decodeURIComponent(code), await parseBody<UserPatchRequestDto>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleActivate(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    return ok(await activateUser(decodeURIComponent(code)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleDeactivate(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { code } = await params;
    return ok(await deactivateUser(decodeURIComponent(code)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchGet(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await parseBody<CodesRequestDto>(req);
    return ok(await batchGetUsers(body.codes ?? []));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    return serverError(err);
  }
}

export async function handleBatchCreate(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return created(await batchCreateUsers(await parseBody<UserCreateRequestDto[]>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}

export async function handleBatchUpdate(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok(await batchUpdateUsers(await parseBody<UserBatchUpdateRequestDto[]>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchPatch(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok(await batchPatchUsers(await parseBody<UserBatchPatchRequestDto[]>(req)));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}



