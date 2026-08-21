import { DataError } from "@voyzu/capability/errors";
import type { DbExecutor } from "@voyzu/capability/db";

import type { OrganizationRow, UpdateOrganizationRow } from "./organization.row.types";

const TABLE = "organization";
const SELECT_WITH_DERIVED = `
  SELECT o.*,
         COALESCE(
           o.updated_mutation_id,
           CASE
           WHEN latest_audit.mutation_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
               THEN latest_audit.mutation_id::uuid
             ELSE NULL
           END
         ) AS updated_mutation_id,
         EXISTS (
           SELECT 1
           FROM company c
           JOIN journal_header jh ON jh.company_id = c.id
           WHERE c.organization_id = o.id
             AND jh.status = 'POSTED'
         ) AS has_postings
  FROM ${TABLE} o
  LEFT JOIN LATERAL (
    SELECT ae.mutation_id
    FROM audit_event ae
    WHERE ae.entity_type = 'organization'
      AND ae.entity_id = o.id::text
      AND ae.mutation_id IS NOT NULL
      AND ae.mutation_id <> ''
    ORDER BY ae.creation_date DESC, ae.id DESC
    LIMIT 1
  ) latest_audit ON true
`;

export class OrganizationRepo {
  constructor(private readonly db: DbExecutor) { }

  async get(): Promise<OrganizationRow | null> {
    const { rows } = await this.db.query(`${SELECT_WITH_DERIVED} LIMIT 1`);
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async update(id: number, row: UpdateOrganizationRow): Promise<OrganizationRow> {
    const sets: string[] = [
      `organization_name = $1`,
    ];
    const vals: unknown[] = [row.organization_name];

    if (row.code !== undefined) {
      vals.push(row.code);
      sets.push(`code = $${vals.length}`);
    }

    if (row.updated_actor_type !== undefined) {
      vals.push(row.updated_actor_type);
      sets.push(`updated_actor_type = $${vals.length}`);
    }

    if (row.updated_user_id !== undefined) {
      vals.push(row.updated_user_id);
      sets.push(`updated_user_id = $${vals.length}`);
    }

    if (row.updated_mutation_id !== undefined) {
      vals.push(row.updated_mutation_id);
      sets.push(`updated_mutation_id = $${vals.length}`);
    }

    vals.push(id);
    const sql = `UPDATE ${TABLE} SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`;

    const { rows } = await this.db.query(sql, vals);
    if (!rows[0]) throw new DataError(`Organization ${id} not found`);
    const updated = await this.get();
    return updated ?? this.mapRow(rows[0]);
  }

  private mapRow(row: Record<string, unknown>): OrganizationRow {
    return {
      ...row,
      id: Number(row.id),
      status: row.status == null ? "ACTIVE" : String(row.status),
      has_postings: Boolean(row.has_postings),
      creation_date: row.creation_date instanceof Date
        ? row.creation_date.toISOString()
        : String(row.creation_date),
      updated_date: row.updated_date instanceof Date
        ? row.updated_date.toISOString()
        : String(row.updated_date),
    } as OrganizationRow;
  }
}
