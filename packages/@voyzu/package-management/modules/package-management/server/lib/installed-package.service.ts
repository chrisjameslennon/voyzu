import { getDb, withTransaction } from "@voyzu/capability/db";
import { BusinessRuleError, NotFoundError } from "@voyzu/capability/errors";
import { checkResponse } from "@voyzu/capability/validation";

import type {
  InstalledPackageResponseDto,
  InstalledPackageStatus,
} from "../../../types";
import { InstalledPackageRepo } from "../db/installed-package.repo";
import type { InstalledPackageRow } from "../db/installed-package.row.types";
import { ChangeVisibility, isRequiredPackage } from "../../domain/operation-policy";
import { discoverInstalledPackages, type DiscoveredPackage } from "./package-inventory";
import { validateResponse } from "./installed-package.validator";

function response(
  row: InstalledPackageRow,
  discovered: DiscoveredPackage | undefined,
): InstalledPackageResponseDto {
  const dto: InstalledPackageResponseDto = {
    id: row.id,
    code: row.code,
    description: row.description,
    repository: discovered?.repository ?? "",
    status: row.status,
    navOrder: row.nav_order,
    preinstalled: discovered?.preinstalled ?? false,
    hasTopNavigation: discovered?.hasTopNavigation ?? false,
    required: isRequiredPackage(row.code),
    rootPaths: discovered?.rootPaths ?? [],
  };
  return checkResponse(dto, validateResponse(dto), `installed package (id=${dto.id})`);
}

export async function reconcileInstalledPackages(): Promise<InstalledPackageResponseDto[]> {
  const inventory = await discoverInstalledPackages();
  await withTransaction(async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(hashtext('voyzu.installed-packages'))");
    const existing = await new InstalledPackageRepo(db).list();
    const existingByCode = new Map(existing.map((row) => [row.code, row]));
    let nextOrder = existing.reduce((maximum, row) => Math.max(maximum, row.nav_order), -1) + 1;

    for (const packageInfo of inventory) {
      const previous = existingByCode.get(packageInfo.code);
      await db.query(
        `INSERT INTO installed_packages (code, description, status, nav_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description`,
        [
          packageInfo.code,
          packageInfo.description,
          "ACTIVE",
          previous?.nav_order ?? nextOrder++,
        ],
      );
    }

    const names = inventory.map(({ code }) => code);
    if (names.length === 0) {
      await db.query("DELETE FROM installed_packages");
    } else {
      await db.query("DELETE FROM installed_packages WHERE NOT (code = ANY($1::text[]))", [names]);
    }
  });
  return listInstalledPackages();
}

export async function listInstalledPackages(): Promise<InstalledPackageResponseDto[]> {
  const [rows, inventory] = await Promise.all([
    new InstalledPackageRepo(getDb()).list(),
    discoverInstalledPackages(),
  ]);
  const inventoryByCode = new Map(inventory.map((item) => [item.code, item]));
  return rows.map((row) => response(row, inventoryByCode.get(row.code)));
}

export async function getInstalledPackage(id: number): Promise<InstalledPackageResponseDto | null> {
  const [row, inventory] = await Promise.all([
    new InstalledPackageRepo(getDb()).getById(id),
    discoverInstalledPackages(),
  ]);
  if (!row) return null;
  return response(row, inventory.find((item) => item.code === row.code));
}

export async function updateInstalledPackageStatus(
  id: number,
  status: InstalledPackageStatus,
): Promise<InstalledPackageResponseDto> {
  if (status !== "ACTIVE" && status !== "INACTIVE") {
    throw new BusinessRuleError("Status must be ACTIVE or INACTIVE");
  }
  const repo = new InstalledPackageRepo(getDb());
  const existing = await repo.getById(id);
  if (!existing) throw new NotFoundError(`Package id ${id} not found`);
  const visibilityBlockers = ChangeVisibility(existing, status);
  if (visibilityBlockers.length) {
    throw new BusinessRuleError(visibilityBlockers.map(({ message }) => message).join("; "));
  }
  if (status === "INACTIVE") {
    const inventory = await discoverInstalledPackages();
    const packageInfo = inventory.find(({ code }) => code === existing.code);
    const homeSegment = firstPathSegment(await getHomePageRoute());
    if (homeSegment && packageInfo?.rootPaths.some((path) => firstPathSegment(path) === homeSegment)) {
      throw new BusinessRuleError(`${existing.code} contains the configured home page and cannot be deactivated`);
    }
  }
  const row = await repo.updateStatus(id, status);
  const inventory = await discoverInstalledPackages();
  return response(row, inventory.find((item) => item.code === row.code));
}

const HOME_PAGE_SETTING = "HOME_PAGE_ROUTE";

function firstPathSegment(path: string): string | undefined {
  return path.split("/").filter(Boolean)[0];
}

export async function getHomePageRoute(): Promise<string> {
  const { rows } = await getDb().query(
    "SELECT value FROM voyzu_settings WHERE code = $1",
    [HOME_PAGE_SETTING],
  );
  return rows[0]?.value ? String(rows[0].value) : "/welcome";
}

export async function updateHomePageRoute(route: string): Promise<string> {
  await getDb().query(
    `INSERT INTO voyzu_settings (code, value)
     VALUES ($1, $2)
     ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value`,
    [HOME_PAGE_SETTING, route],
  );
  return route;
}

export async function moveInstalledPackage(
  id: number,
  direction: "up" | "down",
): Promise<InstalledPackageResponseDto[]> {
  if (direction !== "up" && direction !== "down") {
    throw new BusinessRuleError("Direction must be up or down");
  }
  await withTransaction(async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(hashtext('voyzu.installed-packages'))");
    const repo = new InstalledPackageRepo(db);
    const inventory = await discoverInstalledPackages();
    const navigationNames = new Set(
      inventory.filter(({ hasTopNavigation }) => hasTopNavigation).map(({ code: name }) => name),
    );
    const rows = (await repo.list()).filter(({ code: name }) => navigationNames.has(name));
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) throw new NotFoundError(`Navigation package id ${id} not found`);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const current = rows[index];
    const target = rows[targetIndex];
    await repo.updateOrder(current.code, target.nav_order);
    await repo.updateOrder(target.code, current.nav_order);
  });
  return listInstalledPackages();
}

export async function isInstalledPackageActive(code: string | undefined): Promise<boolean> {
  if (!code) return true;
  try {
    const row = await new InstalledPackageRepo(getDb()).get(code);
    return row?.status !== "INACTIVE";
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return true;
    throw error;
  }
}
