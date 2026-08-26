import { getDb, withTransaction, type DbExecutor } from "@voyzu/capability/db";
import { BusinessRuleError, NotFoundError } from "@voyzu/capability/errors";

import type {
  InstalledPackageResponseDto,
} from "@voyzu/package-management/types";
import { InstalledPackageRepo } from "../db/installed-package.repo";
import type { InstalledPackageRow } from "../db/installed-package.row.types";
import { ChangePageRouteVisibility, isRequiredPackage } from "../../domain/operation-policy";
import { discoverInstalledPackages, type DiscoveredPackage } from "./package-inventory";

function response(
  row: InstalledPackageRow,
  discovered: DiscoveredPackage | undefined,
): InstalledPackageResponseDto {
  const dto: InstalledPackageResponseDto = {
    id: row.id,
    code: row.code,
    description: row.description,
    repository: discovered?.repository ?? "",
    topNavigationVisible: row.top_navigation_visible,
    pageRoutesVisible: row.page_routes_visible,
    navOrder: row.nav_order,
    preinstalled: discovered?.preinstalled ?? false,
    hasTopNavigation: discovered?.hasTopNavigation ?? false,
    required: isRequiredPackage(row.code),
    pageRootPaths: discovered?.pageRootPaths ?? [],
    apiRootPaths: discovered?.apiRootPaths ?? [],
  };
  return dto;
}

export async function reconcileInstalledPackages(): Promise<InstalledPackageResponseDto[]> {
  const inventory = await discoverInstalledPackages();
  return withTransaction(async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(hashtext('voyzu.installed-packages'))");
    const existing = await new InstalledPackageRepo(db).list();
    const existingByCode = new Map(existing.map((row) => [row.code, row]));
    let nextOrder = existing.reduce((maximum, row) => Math.max(maximum, row.nav_order), -1) + 1;

    for (const packageInfo of inventory) {
      const previous = existingByCode.get(packageInfo.code);
      await db.query(
        `INSERT INTO installed_packages (code, description, nav_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description`,
        [
          packageInfo.code,
          packageInfo.description,
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
    const packages = await listInstalledPackagesWith(db, inventory);
    return packages;
  });
}

export async function listInstalledPackages(): Promise<InstalledPackageResponseDto[]> {
  return listInstalledPackagesWith(getDb());
}

async function listInstalledPackagesWith(
  db: DbExecutor,
  knownInventory?: DiscoveredPackage[],
): Promise<InstalledPackageResponseDto[]> {
  const [rows, inventory] = await Promise.all([
    new InstalledPackageRepo(db).list(),
    knownInventory ?? discoverInstalledPackages(),
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

export async function updateInstalledPackageVisibility(
  id: number,
  topNavigationVisible: boolean,
  pageRoutesVisible: boolean,
): Promise<InstalledPackageResponseDto> {
  return withTransaction(async (db) => {
    const repo = new InstalledPackageRepo(db);
    const existing = await repo.getById(id);
    if (!existing) throw new NotFoundError(`Package id ${id} not found`);
    const visibilityBlockers = ChangePageRouteVisibility(existing, pageRoutesVisible);
    if (visibilityBlockers.length) {
      throw new BusinessRuleError(visibilityBlockers.map(({ message }) => message).join("; "));
    }
    const inventory = await discoverInstalledPackages();
    if (!pageRoutesVisible) {
      const packageInfo = inventory.find(({ code }) => code === existing.code);
      const homeSegment = firstPathSegment(await getHomePageRouteWith(db));
      if (homeSegment && packageInfo?.pageRootPaths.some((path) => firstPathSegment(path) === homeSegment)) {
        throw new BusinessRuleError(`${existing.code} contains the configured home page and its page routes cannot be hidden`);
      }
    }
    const row = await repo.updateVisibility(id, topNavigationVisible, pageRoutesVisible);
    const packageDto = response(row, inventory.find((item) => item.code === row.code));
    return packageDto;
  });
}

const HOME_PAGE_SETTING = "HOME_PAGE_ROUTE";

function firstPathSegment(path: string): string | undefined {
  return path.split("/").filter(Boolean)[0];
}

export async function getHomePageRoute(): Promise<string> {
  return getHomePageRouteWith(getDb());
}

async function getHomePageRouteWith(db: DbExecutor): Promise<string> {
  const { rows } = await db.query(
    "SELECT value FROM voyzu_settings WHERE code = $1",
    [HOME_PAGE_SETTING],
  );
  return rows[0]?.value ? String(rows[0].value) : "/welcome";
}

export async function updateHomePageRoute(route: string): Promise<string> {
  return withTransaction(async (db) => {
    await db.query(
      `INSERT INTO voyzu_settings (code, value)
       VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value`,
      [HOME_PAGE_SETTING, route],
    );
    return route;
  });
}

export async function moveInstalledPackage(
  id: number,
  direction: "up" | "down",
): Promise<InstalledPackageResponseDto[]> {
  return withTransaction(async (db) => {
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
    if (targetIndex >= 0 && targetIndex < rows.length) {
      const current = rows[index];
      const target = rows[targetIndex];
      await repo.updateOrder(current.code, target.nav_order);
      await repo.updateOrder(target.code, current.nav_order);
    }
    const packages = await listInstalledPackagesWith(db, inventory);
    return packages;
  });
}

export async function areInstalledPackagePageRoutesVisible(code: string | undefined): Promise<boolean> {
  if (!code) return true;
  try {
    const row = await new InstalledPackageRepo(getDb()).get(code);
    return row?.page_routes_visible !== false;
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return true;
    throw error;
  }
}

export async function isInstalledPackageTopNavigationVisible(code: string | undefined): Promise<boolean> {
  if (!code) return true;
  try {
    const row = await new InstalledPackageRepo(getDb()).get(code);
    return row?.top_navigation_visible !== false;
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return true;
    throw error;
  }
}
