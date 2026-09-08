import type { DbExecutor } from "@voyzu/capability/db";
import { DataError } from "@voyzu/capability/errors";

import type { InstalledPackageRow } from "./installed-package.row.types";

function mapRow(row: Record<string, unknown>): InstalledPackageRow {
  return {
    id: Number(row.id),
    code: String(row.code),
    description: String(row.description ?? ""),
    top_navigation_visible: Boolean(row.top_navigation_visible),
    page_routes_visible: Boolean(row.page_routes_visible),
    nav_order: Number(row.nav_order),
  };
}

export class InstalledPackageRepo {
  constructor(private readonly db: DbExecutor) {}

  async list(): Promise<InstalledPackageRow[]> {
    const { rows } = await this.db.query(
      "SELECT id, code, description, top_navigation_visible, page_routes_visible, nav_order FROM installed_packages ORDER BY nav_order, code",
    );
    return rows.map(mapRow);
  }

  async get(code: string): Promise<InstalledPackageRow | null> {
    const { rows } = await this.db.query(
      "SELECT id, code, description, top_navigation_visible, page_routes_visible, nav_order FROM installed_packages WHERE code = $1",
      [code],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async getById(id: number): Promise<InstalledPackageRow | null> {
    const { rows } = await this.db.query(
      "SELECT id, code, description, top_navigation_visible, page_routes_visible, nav_order FROM installed_packages WHERE id = $1",
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async updateVisibility(
    id: number,
    topNavigationVisible: boolean,
    pageRoutesVisible: boolean,
  ): Promise<InstalledPackageRow> {
    const { rows } = await this.db.query(
      `UPDATE installed_packages
       SET top_navigation_visible = $2, page_routes_visible = $3
       WHERE id = $1
       RETURNING id, code, description, top_navigation_visible, page_routes_visible, nav_order`,
      [id, topNavigationVisible, pageRoutesVisible],
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

  lockInventory() {
    return this.db.query("SELECT pg_advisory_xact_lock(hashtext('voyzu.installed-packages'))");
  }

  upsertDiscovered(code: string, description: string, navOrder: number) {
    return this.db.query(`INSERT INTO installed_packages (code, description, nav_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description`, [code, description, navOrder]);
  }

  deleteAll() {
    return this.db.query("DELETE FROM installed_packages");
  }

  deleteNotIn(codes: string[]) {
    return this.db.query("DELETE FROM installed_packages WHERE NOT (code = ANY($1::text[]))", [codes]);
  }

  getSetting(code: string) {
    return this.db.query("SELECT value FROM voyzu_settings WHERE code = $1", [code]);
  }

  setSetting(code: string, value: string) {
    return this.db.query(`INSERT INTO voyzu_settings (code, value)
       VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value`, [code, value]);
  }
}
