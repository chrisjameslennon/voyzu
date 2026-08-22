import { DataError } from "@voyzu/capability/errors";
import type { ActorType } from "@voyzu/localization/types/modules/core";
import type { Filter } from "@voyzu/types/params";
import type { ListOptions } from "@voyzu/types/params";

import type { DbExecutor } from "@voyzu/capability/db";

import type { CurrencyRow, InsertCurrencyRow, UpdateCurrencyRow, PatchCurrencyRow } from "./currency.row.types";

const TABLE = "currency";

const COLUMNS: readonly string[] = [
  "code", "name", "symbol", "status",
  "creation_date", "creation_actor_type", "creation_user_id", "creation_mutation_id",
  "updated_date", "updated_actor_type", "updated_user_id", "updated_mutation_id",
];

const MUTABLE_COLUMNS: readonly string[] = [
  "name", "symbol",
];

const SEARCHABLE_COLUMNS: readonly string[] = [
  "code", "name", "symbol", "status",
];

const SELECT_SQL = `
  SELECT cur.*
  FROM ${TABLE} cur
`;

function assertColumn(field: string): void {
  if (!COLUMNS.includes(field)) {
    throw new Error(`Unknown column: ${field}`);
  }
}

function buildWhere(filters: Filter[], tableAlias?: string): { sql: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];

  for (const f of filters) {
    assertColumn(f.field);
    const column = tableAlias ? `${tableAlias}.${f.field}` : f.field;

    switch (f.operator) {
      case "=":
      case "!=":
      case "<":
      case "<=":
      case ">":
      case ">=":
      case "LIKE":
      case "ILIKE":
        params.push(f.value);
        parts.push(`${column} ${f.operator} $${params.length}`);
        break;
      case "IN":
      case "NOT IN": {
        params.push(f.value);
        const op = f.operator === "IN" ? "= ANY" : "!= ALL";
        parts.push(`${column} ${op} ($${params.length}::text[])`);
        break;
      }
      case "BETWEEN": {
        const [lo, hi] = f.value as [string | number, string | number];
        params.push(lo, hi);
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
    const parts = options.orderBy.map((ob) => {
      assertColumn(ob.field);
      return `${ob.field} ${ob.direction ?? "ASC"}`;
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

export class CurrencyRepo {
  constructor(private readonly db: DbExecutor) { }

  // ── Item operations ──

  async insert(row: InsertCurrencyRow): Promise<CurrencyRow> {
    const cols: string[] = [];
    const vals: unknown[] = [];

    for (const [key, value] of Object.entries(row)) {
      if (value !== undefined) {
        assertColumn(key);
        cols.push(key);
        vals.push(value);
      }
    }

    const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `
      WITH inserted AS (
        INSERT INTO ${TABLE} (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *
      )
      SELECT inserted.*
      FROM inserted
    `;

    const { rows } = await this.db.query(sql, vals);
    return this.mapRow(rows[0]);
  }

  async get(code: string): Promise<CurrencyRow | null> {
    const { rows } = await this.db.query(
      `${SELECT_SQL} WHERE cur.code = $1 AND cur.status != 'DELETED'`,
      [code],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async update(code: string, row: UpdateCurrencyRow): Promise<CurrencyRow> {
    const vals: unknown[] = [];
    const sets = MUTABLE_COLUMNS.map((col) => {
      vals.push((row as unknown as Record<string, unknown>)[col] ?? null);
      return `${col} = $${vals.length}`;
    });

    if (row.updated_user_id !== undefined) {
      vals.push(row.updated_user_id);
      sets.push(`updated_user_id = $${vals.length}`);
    }
    if (row.updated_actor_type !== undefined) {
      vals.push(row.updated_actor_type);
      sets.push(`updated_actor_type = $${vals.length}::actor_type`);
    }
    if (row.updated_date !== undefined) {
      vals.push(row.updated_date);
      sets.push(`updated_date = $${vals.length}::timestamptz`);
    }
    if (row.updated_mutation_id !== undefined) {
      vals.push(row.updated_mutation_id);
      sets.push(`updated_mutation_id = $${vals.length}::uuid`);
    }

    vals.push(code);
    const sql = `
      WITH updated AS (
        UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${vals.length} RETURNING *
      )
      SELECT updated.*
      FROM updated
    `;

    const { rows } = await this.db.query(sql, vals);
    if (!rows[0]) throw new DataError(`Currency ${code} not found`);
    return this.mapRow(rows[0]);
  }

  async patch(code: string, updates: PatchCurrencyRow): Promise<CurrencyRow> {
    const sets: string[] = [];
    const vals: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        assertColumn(key);
        vals.push(value);
        if (key === "updated_actor_type") {
          sets.push(`${key} = $${vals.length}::actor_type`);
        } else if (key === "updated_date") {
          sets.push(`${key} = $${vals.length}::timestamptz`);
        } else if (key === "updated_mutation_id") {
          sets.push(`${key} = $${vals.length}::uuid`);
        } else {
          sets.push(`${key} = $${vals.length}`);
        }
      }
    }

    if (sets.length === 0) {
      const existing = await this.get(code);
      if (!existing) throw new DataError(`Currency ${code} not found`);
      return existing;
    }

    vals.push(code);
    const sql = `
      WITH updated AS (
        UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${vals.length} RETURNING *
      )
      SELECT updated.*
      FROM updated
    `;

    const { rows } = await this.db.query(sql, vals);
    if (!rows[0]) throw new DataError(`Currency ${code} not found`);
    return this.mapRow(rows[0]);
  }

  async delete(code: string): Promise<void> {
    await this.db.query(`DELETE FROM ${TABLE} WHERE code = $1`, [code]);
  }

  // ── Collection operations ──

  async listAll(): Promise<CurrencyRow[]> {
    const { rows } = await this.db.query(
      `${SELECT_SQL} WHERE cur.status != 'DELETED' ORDER BY cur.code ASC`,
    );
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async filter(filters: Filter[], options?: ListOptions): Promise<CurrencyRow[]> {
    const { sql: whereSql, params } = buildWhere(filters, "cur");
    const fullWhere = whereSql
      ? `${whereSql} AND cur.status != 'DELETED'`
      : `WHERE cur.status != 'DELETED'`;
    const tail = buildOrderLimitOffset(params, options);
    const sql = `${SELECT_SQL} ${fullWhere} ${tail}`;
    const { rows } = await this.db.query(sql, params);
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async search(phrase: string, options?: ListOptions): Promise<CurrencyRow[]> {
    const params: unknown[] = [];
    const pattern = `%${phrase}%`;

    const likeParts = SEARCHABLE_COLUMNS.map((col) => {
      params.push(pattern);
      return `cur.${col}::text ILIKE $${params.length}`;
    });
    const whereSql = `WHERE (${likeParts.join(" OR ")}) AND cur.status != 'DELETED'`;

    const tail = buildOrderLimitOffset(params, options);
    const sql = `${SELECT_SQL} ${whereSql} ${tail}`;
    const { rows } = await this.db.query(sql, params);
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  // ── Batch operations ──

  async batchGet(codes: string[]): Promise<CurrencyRow[]> {
    if (!codes.length) return [];
    const { rows } = await this.db.query(
      `${SELECT_SQL} WHERE cur.code = ANY($1::text[]) AND cur.status != 'DELETED' ORDER BY cur.code ASC`,
      [codes],
    );
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async batchDelete(codes: string[]): Promise<void> {
    if (!codes.length) return;
    await this.db.query(`DELETE FROM ${TABLE} WHERE code = ANY($1::text[])`, [codes]);
  }

  async batchUpdateStatus(
    codes: string[],
    status: "ACTIVE" | "INACTIVE",
    audit: {
      actorType: ActorType;
      userId: string | null;
      mutationId: string;
      timestamp: string;
    },
  ): Promise<CurrencyRow[]> {
    if (!codes.length) return [];
    await this.db.query(
      `UPDATE ${TABLE}
       SET status = $2,
           updated_date = $3::timestamptz,
           updated_actor_type = $4::actor_type,
           updated_user_id = $5,
           updated_mutation_id = $6::uuid
       WHERE code = ANY($1::text[])
         AND status != 'DELETED'`,
      [codes, status, audit.timestamp, audit.actorType, audit.userId, audit.mutationId],
    );
    return this.batchGet(codes);
  }

  private mapRow(row: Record<string, unknown>): CurrencyRow {
    return {
      ...row,
      creation_date: row.creation_date instanceof Date
        ? row.creation_date.toISOString()
        : String(row.creation_date),
      updated_date: row.updated_date instanceof Date
        ? row.updated_date.toISOString()
        : String(row.updated_date),
    } as CurrencyRow;
  }
}
