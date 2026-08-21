import type { ActorType } from "@voyzu/organization/types/modules/core";
import { DataError } from "@voyzu/capability/errors";
import type { Filter } from "@voyzu/types/params";
import type { ListOptions } from "@voyzu/types/params";

import type { DbExecutor } from "@voyzu/capability/db";

import type { CompanyRow, InsertCompanyRow, UpdateCompanyRow, PatchCompanyRow } from "./company.row.types";

const TABLE = "company";

const COLUMNS: readonly string[] = [
  "id", "code", "name", "country_code", "base_currency_code",
  "report_line_1", "report_line_2", "report_footer",
  "tax_filing_anchor_month", "tax_filing_interval_months",
  "use_organization_standard_settings",
  "status", "organization_id", "is_template",
  "creation_date", "creation_actor_type", "creation_user_id", "creation_mutation_id",
  "updated_date", "updated_actor_type", "updated_user_id", "updated_mutation_id",
];

const MUTABLE_COLUMNS: readonly string[] = [
  "code", "name", "country_code", "base_currency_code",
  "report_line_1", "report_line_2", "report_footer",
  "tax_filing_anchor_month", "tax_filing_interval_months",
  "use_organization_standard_settings",
];

const SEARCHABLE_COLUMNS: readonly string[] = [
  "code", "name", "country_code", "base_currency_code",
  "report_line_1", "report_line_2", "status", "use_organization_standard_settings",
];

const HAS_POSTINGS_SQL = `EXISTS (
  SELECT 1
  FROM journal_header jh
  WHERE jh.company_id = c.id
    AND jh.status = 'POSTED'
) AS has_postings`;

const SELECT_WITH_DERIVED = `SELECT c.*, ${HAS_POSTINGS_SQL}`;

interface DeletionAuditStamp {
  actorType: ActorType;
  userId: string | null;
  mutationId: string;
  timestamp: string;
}

function assertColumn(field: string): void {
  if (!COLUMNS.includes(field)) {
    throw new Error(`Unknown column: ${field}`);
  }
}

function buildWhere(filters: Filter[]): { sql: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];

  for (const f of filters) {
    assertColumn(f.field);

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
        parts.push(`${f.field} ${f.operator} $${params.length}`);
        break;
      case "IN":
      case "NOT IN": {
        params.push(f.value);
        const op = f.operator === "IN" ? "= ANY" : "!= ALL";
        parts.push(`${f.field} ${op} ($${params.length}::text[])`);
        break;
      }
      case "BETWEEN": {
        const [lo, hi] = f.value as [string | number, string | number];
        params.push(lo, hi);
        parts.push(`${f.field} BETWEEN $${params.length - 1} AND $${params.length}`);
        break;
      }
      case "IS NULL":
        parts.push(`${f.field} IS NULL`);
        break;
      case "IS NOT NULL":
        parts.push(`${f.field} IS NOT NULL`);
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

export class CompanyRepo {
  constructor(private readonly db: DbExecutor) { }

  // ── Item operations ──

  async insert(row: InsertCompanyRow): Promise<CompanyRow> {
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
    const sql = `INSERT INTO ${TABLE} (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *`;

    const { rows } = await this.db.query(sql, vals);
    return this.mapRow(rows[0]);
  }

  async get(code: string): Promise<CompanyRow | null> {
    const { rows } = await this.db.query(
      `${SELECT_WITH_DERIVED} FROM ${TABLE} c WHERE c.code = $1 AND c.status != 'DELETED'`,
      [code],
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async update(code: string, row: UpdateCompanyRow): Promise<CompanyRow> {
    const vals: unknown[] = [];
    const sets = MUTABLE_COLUMNS.map((col) => {
      vals.push((row as unknown as Record<string, unknown>)[col] ?? null);
      return `${col} = $${vals.length}`;
    });

    if (row.updated_user_id !== undefined) {
      vals.push(row.updated_user_id);
      sets.push(`updated_user_id = $${vals.length}`);
    }
    if (row.updated_date !== undefined) {
      vals.push(row.updated_date);
      sets.push(`updated_date = $${vals.length}`);
    }
    if (row.updated_actor_type !== undefined) {
      vals.push(row.updated_actor_type);
      sets.push(`updated_actor_type = $${vals.length}::actor_type`);
    }
    if (row.updated_mutation_id !== undefined) {
      vals.push(row.updated_mutation_id);
      sets.push(`updated_mutation_id = $${vals.length}::uuid`);
    }

    vals.push(code);
    const sql = `UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${vals.length} RETURNING *`;

    const { rows } = await this.db.query(sql, vals);
    if (!rows[0]) throw new DataError(`Company ${code} not found`);
    const updated = await this.get(String(rows[0].code));
    return updated ?? this.mapRow(rows[0]);
  }

  async patch(code: string, updates: PatchCompanyRow): Promise<CompanyRow> {
    const sets: string[] = [];
    const vals: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        assertColumn(key);
        vals.push(value);
        sets.push(`${key} = $${vals.length}`);
      }
    }

    if (sets.length === 0) {
      const existing = await this.get(code);
      if (!existing) throw new DataError(`Company ${code} not found`);
      return existing;
    }

    vals.push(code);
    const sql = `UPDATE ${TABLE} SET ${sets.join(", ")} WHERE code = $${vals.length} RETURNING *`;

    const { rows } = await this.db.query(sql, vals);
    if (!rows[0]) throw new DataError(`Company ${code} not found`);
    const updated = await this.get(String(rows[0].code));
    return updated ?? this.mapRow(rows[0]);
  }

  async delete(code: string, audit: DeletionAuditStamp): Promise<void> {
    await this.batchDelete([code], audit);
  }
  // ── Collection operations ──

  async listAll(): Promise<CompanyRow[]> {
    const { rows } = await this.db.query(
      `SELECT c.*, cur.name AS currency_name, cty.name AS country_name, ${HAS_POSTINGS_SQL}
       FROM ${TABLE} c
       JOIN currency cur ON cur.code = c.base_currency_code
       JOIN country cty ON cty.code = c.country_code
       WHERE c.status != 'DELETED' AND c.is_template = false
       ORDER BY c.code ASC`,
    );
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async filter(filters: Filter[], options?: ListOptions): Promise<CompanyRow[]> {
    const { sql: whereSql, params } = buildWhere(filters);
    const fullWhere = whereSql
      ? `${whereSql} AND status != 'DELETED' AND is_template = false`
      : `WHERE status != 'DELETED' AND is_template = false`;
    const tail = buildOrderLimitOffset(params, options);
    const sql = `${SELECT_WITH_DERIVED} FROM ${TABLE} c ${fullWhere.replaceAll("status", "c.status").replaceAll("is_template", "c.is_template")} ${tail}`;
    const { rows } = await this.db.query(sql, params);
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  async search(phrase: string, options?: ListOptions): Promise<CompanyRow[]> {
    const params: unknown[] = [];
    const pattern = `%${phrase}%`;

    const likeParts = SEARCHABLE_COLUMNS.map((col) => {
      params.push(pattern);
      return `${col}::text ILIKE $${params.length}`;
    });
    const whereSql = `WHERE (${likeParts.join(" OR ")}) AND c.status != 'DELETED' AND c.is_template = false`;

    const tail = buildOrderLimitOffset(params, options);
    const sql = `${SELECT_WITH_DERIVED} FROM ${TABLE} c ${whereSql} ${tail}`;
    const { rows } = await this.db.query(sql, params);
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
  }

  // ── Batch operations ──

  async batchGet(codes: string[]): Promise<CompanyRow[]> {
    if (!codes.length) return [];
    const { rows } = await this.db.query(
      `${SELECT_WITH_DERIVED} FROM ${TABLE} c WHERE c.code = ANY($1::text[]) AND c.status != 'DELETED' AND c.is_template = false ORDER BY c.code ASC`,
      [codes],
    );
    return rows.map((r: Record<string, unknown>) => this.mapRow(r));
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
  ): Promise<CompanyRow[]> {
    if (!codes.length) return [];
    await this.db.query(
      `UPDATE ${TABLE}
       SET status = $2,
           updated_date = $3,
           updated_actor_type = $4::actor_type,
           updated_user_id = $5,
           updated_mutation_id = $6::uuid
       WHERE code = ANY($1::text[])
         AND status != 'DELETED'
         AND is_template = false`,
      [codes, status, audit.timestamp, audit.actorType, audit.userId, audit.mutationId],
    );
    return this.batchGet(codes);
  }

  async batchDelete(codes: string[], audit: DeletionAuditStamp): Promise<void> {
    if (!codes.length) return;
    const { rows } = await this.db.query(
      `SELECT id FROM ${TABLE} WHERE code = ANY($1::text[])`,
      [codes],
    );
    const companyIds = rows.map((row) => Number(row.id));
    if (!companyIds.length) return;

    const directDeletes = ["trial_balance_snapshot", "posting_batch"];
    for (const table of directDeletes) {
      await this.db.query(`DELETE FROM ${table} WHERE company_id = ANY($1::bigint[])`, [companyIds]);
    }

    const deletes: Array<{ table: string; where: string }> = [
      { table: "inventory_ledger_entry_line", where: "inventory_ledger_entry_header_id IN (SELECT id FROM inventory_ledger_entry_header WHERE company_id = ANY($1::bigint[]))" },
      { table: "tax_ledger_entry_line", where: "tax_ledger_entry_header_id IN (SELECT id FROM tax_ledger_entry_header WHERE company_id = ANY($1::bigint[]))" },
      { table: "ar_subledger_entry_line", where: "ar_subledger_entry_header_id IN (SELECT id FROM ar_subledger_entry_header WHERE company_id = ANY($1::bigint[]))" },
      { table: "ap_subledger_entry_line", where: "ap_subledger_entry_header_id IN (SELECT id FROM ap_subledger_entry_header WHERE company_id = ANY($1::bigint[]))" },
      { table: "journal_line_dimension", where: "journal_line_id IN (SELECT id FROM journal_line WHERE journal_header_id IN (SELECT id FROM journal_header WHERE company_id = ANY($1::bigint[])))" },
      { table: "journal_line", where: "journal_header_id IN (SELECT id FROM journal_header WHERE company_id = ANY($1::bigint[]))" },
      { table: "inventory_ledger_entry_header", where: "company_id = ANY($1::bigint[])" },
      { table: "tax_ledger_entry_header", where: "company_id = ANY($1::bigint[])" },
      { table: "ar_subledger_entry_header", where: "company_id = ANY($1::bigint[])" },
      { table: "ap_subledger_entry_header", where: "company_id = ANY($1::bigint[])" },
      { table: "journal_header", where: "company_id = ANY($1::bigint[])" },
      { table: "inventory_item", where: "company_id = ANY($1::bigint[])" },
      { table: "inventory_category", where: "company_id = ANY($1::bigint[])" },
      { table: "item_posting_profile", where: "company_id = ANY($1::bigint[])" },
      { table: "financial_document_default", where: "company_id = ANY($1::bigint[])" },
      { table: "dimension_value", where: "company_id = ANY($1::bigint[])" },
      { table: "dimension", where: "company_id = ANY($1::bigint[])" },
      { table: "bank_cash_control_account", where: "company_id = ANY($1::bigint[])" },
      { table: "inventory_control_account", where: "company_id = ANY($1::bigint[])" },
      { table: "tax_control_account", where: "company_id = ANY($1::bigint[])" },
      { table: "ar_control_account", where: "company_id = ANY($1::bigint[])" },
      { table: "ap_control_account", where: "company_id = ANY($1::bigint[])" },
      { table: "ar_counterparty", where: "company_id = ANY($1::bigint[])" },
      { table: "ap_counterparty", where: "company_id = ANY($1::bigint[])" },
      { table: "fiscal_period", where: "company_id = ANY($1::bigint[])" },
      { table: "fiscal_year", where: "company_id = ANY($1::bigint[])" },
      { table: "gl_account", where: "company_id = ANY($1::bigint[])" },
      { table: "gl_account_category", where: "company_id = ANY($1::bigint[])" },
      { table: "app_user_assignment", where: "company_id = ANY($1::bigint[])" },
    ];

    for (const statement of deletes) {
      if (statement.table === "journal_line") {
        await this.db.query("SET LOCAL session_replication_role = replica");
      }
      await this.stampDeletion(statement.table, statement.where, companyIds, audit);
      await this.db.query(`DELETE FROM ${statement.table} WHERE ${statement.where}`, [companyIds]);
      if (statement.table === "journal_header") {
        await this.db.query("SET LOCAL session_replication_role = origin");
      }
    }

    await this.db.query(
      `UPDATE audit_event SET company_id = NULL WHERE company_id = ANY($1::bigint[])`,
      [companyIds],
    );
    await this.stampDeletion(TABLE, "id = ANY($1::bigint[])", companyIds, audit);
    await this.db.query(
      `DELETE FROM ${TABLE} WHERE id = ANY($1::bigint[])`,
      [companyIds],
    );
  }

  private async stampDeletion(table: string, where: string, companyIds: number[], audit: DeletionAuditStamp): Promise<void> {
    await this.db.query(
      `UPDATE ${table}
       SET deletion_date = $2,
           deletion_actor_type = $3::actor_type,
           deletion_user_id = $4,
           deletion_mutation_id = $5::uuid
       WHERE ${where}`,
      [companyIds, audit.timestamp, audit.actorType, audit.userId, audit.mutationId],
    );
  }

  // ── Row mapping ──

  private mapRow(row: Record<string, unknown>): CompanyRow {
    return {
      ...row,
      id: Number(row.id),
      tax_filing_anchor_month: Number(row.tax_filing_anchor_month),
      tax_filing_interval_months: Number(row.tax_filing_interval_months),
      use_organization_standard_settings: row.use_organization_standard_settings == null
        ? true
        : Boolean(row.use_organization_standard_settings),
      has_postings: Boolean(row.has_postings),
      creation_date: row.creation_date instanceof Date
        ? row.creation_date.toISOString()
        : String(row.creation_date),
      updated_date: row.updated_date instanceof Date
        ? row.updated_date.toISOString()
        : String(row.updated_date),
    } as CompanyRow;
  }
}
