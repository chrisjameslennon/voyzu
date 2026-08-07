import type { DbExecutor } from "@voyzu/capability/db";
import { DataError } from "@voyzu/capability/errors";

import type { InstalledPackageStatus } from "../../../types";
import type { InstalledPackageRow } from "./installed-package.row.types";

function mapRow(row: Record<string, unknown>): InstalledPackageRow {
  return {
    id: Number(row.id),
    code: String(row.code),
    description: String(row.description ?? ""),
    status: String(row.status) as InstalledPackageStatus,
    nav_order: Number(row.nav_order),
  };
}

export class InstalledPackageRepo {
  constructor(private readonly db: DbExecutor) {}

  async list(): Promise<InstalledPackageRow[]> {
    const { rows } = await this.db.query(
      "SELECT id, code, description, status, nav_order FROM installed_packages ORDER BY nav_order, code",
    );
    return rows.map(mapRow);
  }

  async get(code: string): Promise<InstalledPackageRow | null> {
    const { rows } = await this.db.query(
      "SELECT id, code, description, status, nav_order FROM installed_packages WHERE code = $1",
      [code],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async getById(id: number): Promise<InstalledPackageRow | null> {
    const { rows } = await this.db.query(
      "SELECT id, code, description, status, nav_order FROM installed_packages WHERE id = $1",
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async updateStatus(id: number, status: InstalledPackageStatus): Promise<InstalledPackageRow> {
    const { rows } = await this.db.query(
      `UPDATE installed_packages SET status = $2 WHERE id = $1
       RETURNING id, code, description, status, nav_order`,
      [id, status],
    );
    if (!rows[0]) throw new DataError(`Package id ${id} not found`);
    return mapRow(rows[0]);
  }

  async updateOrder(code: string, navOrder: number): Promise<void> {
    await this.db.query(
      "UPDATE installed_packages SET nav_order = $2 WHERE code = $1",
      [code, navOrder],
    );
  }
}
