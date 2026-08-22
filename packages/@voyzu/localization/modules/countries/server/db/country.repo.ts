import { DataError } from "@voyzu/capability/errors";
import type { DbExecutor } from "@voyzu/capability/db";
import type { UpdateAuditStamp } from "@voyzu/localization/common/server";
import type { Filter, ListOptions } from "@voyzu/types/params";

import type { CountryRow, InsertCountryRow, PatchCountryRow, UpdateCountryRow } from "./country.row.types";

const TABLE = "country";

const COLUMNS: readonly string[] = [
  "code",
  "name",
  "currency_code",
  "status",
  "creation_date",
  "creation_actor_type",
  "creation_user_id",
  "creation_mutation_id",
  "updated_date",
  "updated_actor_type",
  "updated_user_id",
  "updated_mutation_id",
];

const MUTABLE_COLUMNS: readonly string[] = [
  "name",
  "currency_code",
];

const SEARCHABLE_COLUMNS: readonly string[] = [
  "code",
  "name",
  "currency_code",
  "status",
];

const SELECT_SQL = `
  SELECT c.*,
         cur.name AS currency_name
  FROM ${TABLE} c
  JOIN currency cur ON cur.code = c.currency_code
`;

function assertColumn(field: string): void {
  if (!COLUMNS.includes(field)) {
    throw new Error(`Unknown column: ${field}`);
  }
}

function buildWhere(filters: Filter[], tableAlias?: string): { sql: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];

  for (const filter of filters) {
    assertColumn(filter.field);
    const column = tableAlias ? `${tableAlias}.${filter.field}` : filter.field;

    switch (filter.operator) {
      case "=":
      case "!=":
      case "<":
      case "<=":
      case ">":
      case ">=":
      case "LIKE":
      case "ILIKE":
        params.push(filter.value);
        parts.push(`${column} ${filter.operator} $${params.length}`);
        break;
      case "IN":
      case "NOT IN": {
        params.push(filter.value);
        const operator = filter.operator === "IN" ? "= ANY" : "!= ALL";
        parts.push(`${column} ${operator} ($${params.length}::text[])`);
        break;
      }
      case "BETWEEN": {
        const [lower, upper] = filter.value as [string | number, string | number];
        params.push(lower, upper);
        parts.push(`${column} BETWEEN $${params.length - 1} AND $${params.length}`);
        break;
      }
      case "IS NULL":
        parts.push(`${column} IS NULL`);
        break;
      case "IS NOT NULL":
        parts.push(`${column} IS NOT NULL`);
        break;
    }
  }

  return { sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", params };
}

function buildOrderLimitOffset(params: unknown[], options?: ListOptions): string {
  let orderSql = "ORDER BY code ASC";
  if (options?.orderBy?.length) {
    const parts = options.orderBy.map((order) => {
      assertColumn(order.field);
      return `${order.field} ${order.direction ?? "ASC"}`;
    });
    orderSql = `ORDER BY ${parts.join(", ")}`;
  }

  let limitOffset = "";
  const limit = options?.limit ?? options?.pagination?.pageSize;
  const offset = options?.offset ?? (
    options?.pagination ? (options.pagination.page - 1) * options.pagination.pageSize : undefined
  );

  if (limit !== undefined) {
    params.push(limit);
    limitOffset += ` LIMIT $${params.length}`;
  }

  if (offset !== undefined) {
    params.push(offset);
    limitOffset += ` OFFSET $${params.length}`;
  }

  return `${orderSql}${limitOffset}`;
}

export class CountryRepo {
  constructor(private readonly db: DbExecutor) { }

  async insert(row: InsertCountryRow): Promise<CountryRow> {
    const columns: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(row)) {
      if (value !== undefined) {
        assertColumn(key);
        columns.push(key);
        values.push(value);
      }
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const sql = `
      WITH inserted AS (
        INSERT INTO ${TABLE} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *
      )
      SELECT inserted.*,
             currency.name AS currency_name
      FROM inserted
      JOIN currency ON currency.code = inserted.currency_code
    `;

    const { rows } = await this.db.query(sql, values);
    return this.mapRow(rows[0]);
  }

  async get(code: string): Promise<CountryRow | null> {
    const { rows } = await this.db.query(
      `${SELECT_SQL} WHERE c.code = $1 AND c.status != 'DELETED'`,
      [code],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async update(code: string, row: UpdateCountryRow): Promise<CountryRow> {
    const values: unknown[] = [];
    const sets = MUTABLE_COLUMNS.map((column) => {
      values.push((row as unknown as Record<string, unknown>)[column] ?? null);
      return `${column} = $${values.length}`;
    });

    if (row.updated_user_id !== undefined) {
      values.push(row.updated_user_id);
      sets.push(`updated_user_id = $${values.length}`);
    }

    if (row.updated_actor_type !== undefined) {
      values.push(row.updated_actor_type);
      sets.push(`updated_actor_type = $${values.length}::actor_type`);
    }

    if (row.updated_date !== undefined) {
      values.push(row.updated_date);
      sets.push(`updated_date = $${values.length}::timestamptz`);
    }

    if (row.updated_mutation_id !== undefined) {
      values.push(row.updated_mutation_id);
      sets.push(`updated_mutation_id = $${values.length}::uuid`);
    }

    values.push(code);
    const sql = `
      WITH updated AS (
        UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${values.length} RETURNING *
      )
      SELECT updated.*,
             currency.name AS currency_name
      FROM updated
      JOIN currency ON currency.code = updated.currency_code
    `;

    const { rows } = await this.db.query(sql, values);
    if (!rows[0]) throw new DataError(`Country ${code} not found`);
    return this.mapRow(rows[0]);
  }

  async patch(code: string, updates: PatchCountryRow): Promise<CountryRow> {
    const sets: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        assertColumn(key);
        values.push(value);
        if (key === "updated_actor_type") {
          sets.push(`${key} = $${values.length}::actor_type`);
        } else if (key === "updated_date") {
          sets.push(`${key} = $${values.length}::timestamptz`);
        } else if (key === "updated_mutation_id") {
          sets.push(`${key} = $${values.length}::uuid`);
        } else {
          sets.push(`${key} = $${values.length}`);
        }
      }
    }

    if (sets.length === 0) {
      const existing = await this.get(code);
      if (!existing) throw new DataError(`Country ${code} not found`);
      return existing;
    }

    values.push(code);
    const sql = `
      WITH updated AS (
        UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${values.length} RETURNING *
      )
      SELECT updated.*,
             currency.name AS currency_name
      FROM updated
      JOIN currency ON currency.code = updated.currency_code
    `;

    const { rows } = await this.db.query(sql, values);
    if (!rows[0]) throw new DataError(`Country ${code} not found`);
    return this.mapRow(rows[0]);
  }

  async delete(code: string): Promise<void> {
    await this.db.query(`DELETE FROM ${TABLE} WHERE code = $1`, [code]);
  }

  async listAll(): Promise<CountryRow[]> {
    const { rows } = await this.db.query(
      `${SELECT_SQL} WHERE c.status != 'DELETED' ORDER BY c.code ASC`,
    );
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async filter(filters: Filter[], options?: ListOptions): Promise<CountryRow[]> {
    const { sql: whereSql, params } = buildWhere(filters, "c");
    const fullWhere = whereSql ? `${whereSql} AND c.status != 'DELETED'` : "WHERE c.status != 'DELETED'";
    const tail = buildOrderLimitOffset(params, options);
    const sql = `${SELECT_SQL} ${fullWhere} ${tail}`;
    const { rows } = await this.db.query(sql, params);
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async search(phrase: string, options?: ListOptions): Promise<CountryRow[]> {
    const params: unknown[] = [];
    const pattern = `%${phrase}%`;
    const likeParts = SEARCHABLE_COLUMNS.map((column) => {
      params.push(pattern);
      return `c.${column}::text ILIKE $${params.length}`;
    });
    const whereSql = `WHERE (${likeParts.join(" OR ")}) AND c.status != 'DELETED'`;
    const tail = buildOrderLimitOffset(params, options);
    const sql = `${SELECT_SQL} ${whereSql} ${tail}`;
    const { rows } = await this.db.query(sql, params);
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async batchGet(codes: string[]): Promise<CountryRow[]> {
    if (!codes.length) return [];
    const { rows } = await this.db.query(
      `${SELECT_SQL} WHERE c.code = ANY($1::text[]) AND c.status != 'DELETED' ORDER BY c.code ASC`,
      [codes],
    );
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async batchDelete(codes: string[]): Promise<void> {
    if (!codes.length) return;
    await this.db.query(`DELETE FROM ${TABLE} WHERE code = ANY($1::text[])`, [codes]);
  }

  async batchUpdateStatus(codes: string[], status: "ACTIVE" | "INACTIVE", audit: UpdateAuditStamp): Promise<CountryRow[]> {
    if (!codes.length) return [];
    const { rows } = await this.db.query(
      `WITH updated AS (
         UPDATE ${TABLE}
            SET status = $2,
                updated_user_id = $3,
                updated_actor_type = $4::actor_type,
                updated_date = $5::timestamptz,
                updated_mutation_id = $6::uuid
          WHERE code = ANY($1::text[])
          RETURNING *
       )
       SELECT updated.*,
              currency.name AS currency_name
       FROM updated
       JOIN currency ON currency.code = updated.currency_code
       ORDER BY updated.code ASC`,
      [
        codes,
        status,
        audit.userId,
        audit.actorType,
        audit.timestamp,
        audit.mutationId,
      ],
    );
    return rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }
  private mapRow(row: Record<string, unknown>): CountryRow {
    return {
      ...row,
      creation_mutation_id: row.creation_mutation_id == null ? null : String(row.creation_mutation_id),
      updated_mutation_id: row.updated_mutation_id == null ? null : String(row.updated_mutation_id),
      creation_date: row.creation_date instanceof Date ? row.creation_date.toISOString() : String(row.creation_date),
      updated_date: row.updated_date instanceof Date ? row.updated_date.toISOString() : String(row.updated_date),
    } as CountryRow;
  }
}
