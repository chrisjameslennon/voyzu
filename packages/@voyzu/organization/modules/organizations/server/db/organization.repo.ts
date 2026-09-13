import type { DbExecutor } from "@voyzu/capability/db";
import { DataError } from "@voyzu/capability/errors";
import type { ActorType } from "@voyzu/organization/types/modules/core";
import type { Filter, ListOptions } from "@voyzu/types/params";

import type { OrganizationRow, InsertOrganizationRow, PatchOrganizationRow, UpdateOrganizationRow } from "./organization.row.types";

const TABLE = "organization";
const COLUMNS = [
  "id", "code", "name", "country_code", "base_currency_code", "status",
  "creation_date", "creation_actor_type", "creation_user_id", "creation_mutation_id",
  "updated_date", "updated_actor_type", "updated_user_id", "updated_mutation_id",
] as const;
const MUTABLE_COLUMNS = ["code", "name", "country_code", "base_currency_code"] as const;
const SEARCHABLE_COLUMNS = ["code", "name", "country_code", "base_currency_code", "status"] as const;

const SELECT_SQL = `
  SELECT c.*, country.name AS country_name, currency.name AS currency_name
  FROM ${TABLE} c
  JOIN country ON country.code = c.country_code
  JOIN currency ON currency.code = c.base_currency_code
`;

function assertColumn(field: string): void {
  if (!(COLUMNS as readonly string[]).includes(field)) throw new Error(`Unknown organization column: ${field}`);
}

function buildWhere(filters: Filter[]): { sql: string; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];
  for (const filter of filters) {
    assertColumn(filter.field);
    const column = `c.${filter.field}`;
    switch (filter.operator) {
      case "=": case "!=": case "<": case "<=": case ">": case ">=": case "LIKE": case "ILIKE":
        params.push(filter.value);
        clauses.push(`${column} ${filter.operator} $${params.length}`);
        break;
      case "IN": case "NOT IN":
        params.push(filter.value);
        clauses.push(`${column} ${filter.operator === "IN" ? "= ANY" : "!= ALL"} ($${params.length}::text[])`);
        break;
      case "BETWEEN": {
        const [lower, upper] = filter.value as [string | number, string | number];
        params.push(lower, upper);
        clauses.push(`${column} BETWEEN $${params.length - 1} AND $${params.length}`);
        break;
      }
      case "IS NULL": clauses.push(`${column} IS NULL`); break;
      case "IS NOT NULL": clauses.push(`${column} IS NOT NULL`); break;
    }
  }
  return { sql: clauses.length ? clauses.join(" AND ") : "", params };
}

function buildTail(params: unknown[], options?: ListOptions): string {
  const order = options?.orderBy?.length
    ? options.orderBy.map((item) => {
      assertColumn(item.field);
      return `c.${item.field} ${item.direction ?? "ASC"}`;
    }).join(", ")
    : "c.code ASC";
  let result = `ORDER BY ${order}`;
  const limit = options?.limit ?? options?.pagination?.pageSize;
  const offset = options?.offset ?? (options?.pagination ? (options.pagination.page - 1) * options.pagination.pageSize : undefined);
  if (limit !== undefined) { params.push(limit); result += ` LIMIT $${params.length}`; }
  if (offset !== undefined) { params.push(offset); result += ` OFFSET $${params.length}`; }
  return result;
}

export class OrganizationRepo {
  constructor(private readonly db: DbExecutor) {}

  async insert(row: InsertOrganizationRow): Promise<OrganizationRow> {
    const columns: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(row)) {
      if (value === undefined) continue;
      assertColumn(key);
      columns.push(key);
      values.push(value);
    }
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const { rows } = await this.db.query(
      `WITH inserted AS (
         INSERT INTO ${TABLE} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *
       )
       SELECT inserted.*, country.name AS country_name, currency.name AS currency_name
       FROM inserted
       JOIN country ON country.code = inserted.country_code
       JOIN currency ON currency.code = inserted.base_currency_code`, values,
    );
    return this.mapRow(rows[0]);
  }

  async get(code: string): Promise<OrganizationRow | null> {
    const { rows } = await this.db.query(`${SELECT_SQL} WHERE c.code = $1 AND c.status != 'DELETED'`, [code]);
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async update(code: string, row: UpdateOrganizationRow): Promise<OrganizationRow> {
    const values: unknown[] = [];
    const sets = MUTABLE_COLUMNS.map((column) => { values.push(row[column]); return `${column} = $${values.length}`; });
    this.addAuditSets(row, sets, values);
    values.push(code);
    return this.returnUpdated(sets, values, code);
  }

  async patch(code: string, row: PatchOrganizationRow): Promise<OrganizationRow> {
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(row)) {
      if (value === undefined) continue;
      assertColumn(key);
      values.push(value);
      const cast = key === "updated_actor_type" ? "::actor_type" : key === "updated_date" ? "::timestamptz" : key === "updated_mutation_id" ? "::uuid" : "";
      sets.push(`${key} = $${values.length}${cast}`);
    }
    if (!sets.length) {
      const existing = await this.get(code);
      if (!existing) throw new DataError(`Organization ${code} not found`);
      return existing;
    }
    values.push(code);
    return this.returnUpdated(sets, values, code);
  }

  async delete(code: string): Promise<void> { await this.db.query(`DELETE FROM ${TABLE} WHERE code = $1`, [code]); }

  async listAll(): Promise<OrganizationRow[]> {
    const { rows } = await this.db.query(`${SELECT_SQL} WHERE c.status != 'DELETED' ORDER BY c.code ASC`);
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async listDirectory(): Promise<Array<{ id: number; code: string; name: string }>> {
    const { rows } = await this.db.query(
      "SELECT id, code, name FROM organization WHERE status != 'DELETED' ORDER BY code ASC",
    );
    return rows.map((row) => ({ id: Number(row.id), code: String(row.code), name: String(row.name) }));
  }

  async filter(filters: Filter[], options?: ListOptions): Promise<OrganizationRow[]> {
    const built = buildWhere(filters);
    const where = [built.sql, "c.status != 'DELETED'"].filter(Boolean).join(" AND ");
    const tail = buildTail(built.params, options);
    const { rows } = await this.db.query(`${SELECT_SQL} WHERE ${where} ${tail}`, built.params);
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async search(phrase: string, options?: ListOptions): Promise<OrganizationRow[]> {
    const params: unknown[] = [];
    const clauses = SEARCHABLE_COLUMNS.map((column) => { params.push(`%${phrase}%`); return `c.${column}::text ILIKE $${params.length}`; });
    const tail = buildTail(params, options);
    const { rows } = await this.db.query(`${SELECT_SQL} WHERE (${clauses.join(" OR ")}) AND c.status != 'DELETED' ${tail}`, params);
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async batchGet(codes: string[]): Promise<OrganizationRow[]> {
    if (!codes.length) return [];
    const { rows } = await this.db.query(`${SELECT_SQL} WHERE c.code = ANY($1::text[]) AND c.status != 'DELETED' ORDER BY c.code ASC`, [codes]);
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async batchDelete(codes: string[]): Promise<void> {
    if (codes.length) await this.db.query(`DELETE FROM ${TABLE} WHERE code = ANY($1::text[])`, [codes]);
  }

  async batchUpdateStatus(codes: string[], status: "ACTIVE" | "INACTIVE", audit: { actorType: ActorType; userId: string | null; mutationId: string; timestamp: string }): Promise<OrganizationRow[]> {
    if (!codes.length) return [];
    await this.db.query(
      `UPDATE ${TABLE} SET status = $2, updated_date = $3::timestamptz, updated_actor_type = $4::actor_type,
       updated_user_id = $5, updated_mutation_id = $6::uuid WHERE code = ANY($1::text[]) AND status != 'DELETED'`,
      [codes, status, audit.timestamp, audit.actorType, audit.userId, audit.mutationId],
    );
    return this.batchGet(codes);
  }

  private async returnUpdated(sets: string[], values: unknown[], code: string): Promise<OrganizationRow> {
    const { rows } = await this.db.query(
      `WITH updated AS (UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${values.length} RETURNING *)
       SELECT updated.*, country.name AS country_name, currency.name AS currency_name FROM updated
       JOIN country ON country.code = updated.country_code JOIN currency ON currency.code = updated.base_currency_code`, values,
    );
    if (!rows[0]) throw new DataError(`Organization ${code} not found`);
    return this.mapRow(rows[0]);
  }

  private addAuditSets(row: UpdateOrganizationRow, sets: string[], values: unknown[]): void {
    for (const key of ["updated_user_id", "updated_actor_type", "updated_date", "updated_mutation_id"] as const) {
      if (row[key] === undefined) continue;
      values.push(row[key]);
      const cast = key === "updated_actor_type" ? "::actor_type" : key === "updated_date" ? "::timestamptz" : key === "updated_mutation_id" ? "::uuid" : "";
      sets.push(`${key} = $${values.length}${cast}`);
    }
  }

  private mapRow(row: Record<string, unknown>): OrganizationRow {
    return { ...row, id: Number(row.id),
      creation_mutation_id: row.creation_mutation_id == null ? null : String(row.creation_mutation_id),
      updated_mutation_id: row.updated_mutation_id == null ? null : String(row.updated_mutation_id),
      creation_date: row.creation_date instanceof Date ? row.creation_date.toISOString() : String(row.creation_date),
      updated_date: row.updated_date instanceof Date ? row.updated_date.toISOString() : String(row.updated_date),
    } as OrganizationRow;
  }

  listActiveCountryNames() {
    return this.db.query(`SELECT code, name FROM country WHERE status = 'ACTIVE' ORDER BY name ASC`);
  }

  listActiveCountryDefaults() {
    return this.db.query("SELECT code, name, currency_code FROM country WHERE status = 'ACTIVE' ORDER BY name ASC");
  }

  findIdByCode(code: string) {
    return this.db.query("SELECT id FROM organization WHERE code = $1", [code]);
  }
}
