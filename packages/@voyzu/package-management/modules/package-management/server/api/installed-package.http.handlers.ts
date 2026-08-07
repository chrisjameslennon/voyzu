import { type NextRequest, NextResponse } from "next/server";

import { currentUserCanManageUsers } from "@voyzu/auth/users/server";
import { BusinessRuleError, NotFoundError } from "@voyzu/capability/errors";
import { businessRuleError, notFoundError, ok, parseBody, serverError } from "@voyzu/capability/http";

import type {
  HomePageRouteUpdateRequestDto,
  InstalledPackageMoveRequestDto,
  InstalledPackageUpdateRequestDto,
} from "../../../types";
import {
  getInstalledPackage,
  getHomePageRoute,
  listInstalledPackages,
  moveInstalledPackage,
  reconcileInstalledPackages,
  updateInstalledPackageStatus,
  updateHomePageRoute,
} from "../lib/installed-package.service";

async function requireAdmin() {
  return await currentUserCanManageUsers()
    ? null
    : NextResponse.json({ error: "You do not have access" }, { status: 403 });
}

export async function handleList(_request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok(await listInstalledPackages());
  } catch (error) {
    return serverError(error);
  }
}

export async function handleGet(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const installedPackage = await getInstalledPackage(Number(id));
    return installedPackage
      ? ok(installedPackage)
      : notFoundError(`Package id ${id} not found`);
  } catch (error) {
    return serverError(error);
  }
}

export async function handleUpdate(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await parseBody<InstalledPackageUpdateRequestDto>(request);
    return ok(await updateInstalledPackageStatus(Number(id), body.status));
  } catch (error) {
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleMove(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await parseBody<InstalledPackageMoveRequestDto>(request);
    return ok(await moveInstalledPackage(Number(id), body.direction));
  } catch (error) {
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleRefresh(_request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok(await reconcileInstalledPackages());
  } catch (error) {
    return serverError(error);
  }
}

function normalizeHomePageRoute(value: unknown): string {
  if (typeof value !== "string") throw new BusinessRuleError("Home page route is required");
  const route = value.trim();
  if (!route.startsWith("/") || route.startsWith("//") || route === "/") {
    throw new BusinessRuleError("Home page route must be a relative application path such as /welcome");
  }
  if (route.includes("?") || route.includes("#") || route.includes("\\")) {
    throw new BusinessRuleError("Home page route cannot contain a query string, fragment, or backslash");
  }
  return route.length > 1 ? route.replace(/\/+$/, "") : route;
}

export async function handleGetHomePage(_request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return ok({ route: await getHomePageRoute() });
  } catch (error) {
    return serverError(error);
  }
}

export async function handleUpdateHomePage(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await parseBody<HomePageRouteUpdateRequestDto>(request);
    const route = normalizeHomePageRoute(body.route);
    const target = new URL(route, request.nextUrl.origin);
    const cookie = request.headers.get("cookie");
    const routeResponse = await fetch(target, {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
      redirect: "manual",
    });
    if (routeResponse.status === 404) {
      throw new BusinessRuleError(`${route} is not a registered Voyzu page route`);
    }
    return ok({ route: await updateHomePageRoute(route) });
  } catch (error) {
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    return serverError(error);
  }
}
