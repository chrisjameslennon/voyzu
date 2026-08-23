import type { DbExecutor } from "@voyzu/capability/db";
import type { ActorType } from "@voyzu/types/modules/core";
import type { AuditEventRow, AuditChangeRow } from "./audit-event.row.types";

const PAGE_SIZE = 50;

export interface AuditEventFilters {
  packageCode?: string;
  organizationId?: string;
  entityType?: string;
  entityCode?: string;
  entityId?: string;
  mutationId?: string;
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  cursor?: string;
}

export interface AuditEventListResult {
  rows: AuditEventRow[];
  nextCursor: string | null;
  totalMatching: number;
}

export class AuditEventRepo {
  constructor(private readonly db: DbExecutor) {}

  async countTotal(): Promise<number> {
    const { rows } = await this.db.query(`SELECT COUNT(*)::int AS n FROM audit_event`);
    return Number(rows[0].n);
  }

  async listEvents(filters: AuditEventFilters = {}): Promise<AuditEventListResult> {
    const filterParts: string[] = [];
    const filterParams: unknown[] = [];

    if (filters.packageCode) {
      filterParams.push(filters.packageCode);
      filterParts.push(`audit_event.package_code = $${filterParams.length}`);
    }
    if (filters.organizationId) {
      const organizationId = Number(filters.organizationId);
      filterParams.push(organizationId);
      filterParts.push(`audit_event.organization_id = $${filterParams.length}`);
    }
    if (filters.entityType) {
      filterParams.push(filters.entityType);
      filterParts.push(`audit_event.entity_type = $${filterParams.length}`);
    }
    if (filters.entityCode) {
      filterParams.push(filters.entityCode);
      filterParts.push(`audit_event.entity_code = $${filterParams.length}`);
    }
    if (filters.entityId) {
      filterParams.push(filters.entityId);
      filterParts.push(`audit_event.entity_id = $${filterParams.length}`);
    }
    if (filters.mutationId) {
      filterParams.push(filters.mutationId);
      filterParts.push(`audit_event.mutation_id = $${filterParams.length}`);
    }
    if (filters.actorId) {
      filterParams.push(filters.actorId);
      filterParts.push(`(audit_event.actor_id = $${filterParams.length} OR actor_user.code = $${filterParams.length})`);
    }
    if (filters.dateFrom) {
      filterParams.push(filters.dateFrom);
      filterParts.push(`audit_event.creation_date >= $${filterParams.length}::timestamptz`);
    }
    if (filters.dateTo) {
      filterParams.push(filters.dateTo + "T23:59:59");
      filterParts.push(`audit_event.creation_date <= $${filterParams.length}::timestamptz`);
    }
    if (filters.search) {
      filterParams.push(`%${filters.search}%`);
      const n = filterParams.length;
      filterParts.push(`(audit_event.code ILIKE $${n} OR audit_event.package_code ILIKE $${n} OR audit_event.entity_type ILIKE $${n} OR audit_event.entity_code ILIKE $${n} OR audit_event.actor_id ILIKE $${n} OR actor_user.code ILIKE $${n})`);
    }

    const filterWhere = filterParts.length ? `WHERE ${filterParts.join(" AND ")}` : "";

    // Count matching records without cursor (full result set size)
    const { rows: countRows } = await this.db.query(
      `SELECT COUNT(*)::int AS n
       FROM audit_event
       LEFT JOIN app_user actor_user ON actor_user.id::text = audit_event.actor_id
       ${filterWhere}`,
      filterParams,
    );
    const totalMatching = Number(countRows[0].n);

    // Add cursor condition on top of filter conditions for the data query
    const pageParts = [...filterParts];
    const pageParams = [...filterParams];
    if (filters.cursor) {
      const parsed = this.parseCursor(filters.cursor);
      if (parsed) {
        pageParams.push(parsed.afterTs);
        const tsIdx = pageParams.length;
        pageParams.push(parsed.afterId);
        const idIdx = pageParams.length;
        pageParts.push(
          `(audit_event.creation_date < $${tsIdx}::timestamptz OR (audit_event.creation_date = $${tsIdx}::timestamptz AND audit_event.id < $${idIdx}))`,
        );
      }
    }

    const pageWhere = pageParts.length ? `WHERE ${pageParts.join(" AND ")}` : "";
    const sql = `
      SELECT audit_event.*, actor_user.code AS actor_code, actor_user.display_name AS actor_display_name, NULL::text AS organization_code
      FROM audit_event
      LEFT JOIN app_user actor_user ON actor_user.id::text = audit_event.actor_id
      ${pageWhere}
      ORDER BY audit_event.creation_date DESC, audit_event.id DESC
      LIMIT ${PAGE_SIZE + 1}
    `;
    const { rows } = await this.db.query(sql, pageParams);

    const hasNextPage = rows.length > PAGE_SIZE;
    const mappedRows = (hasNextPage ? rows.slice(0, PAGE_SIZE) : rows).map(
      (r: Record<string, unknown>) => this.mapEventRow(r),
    );
    const nextCursor = hasNextPage ? this.buildCursor(mappedRows[mappedRows.length - 1]) : null;

    return {
      rows: mappedRows,
      nextCursor,
      totalMatching,
    };
  }

  async listAllForExport(filters: Omit<AuditEventFilters, "cursor"> = {}): Promise<AuditEventRow[]> {
    const filterParts: string[] = [];
    const filterParams: unknown[] = [];

    if (filters.packageCode) {
      filterParams.push(filters.packageCode);
      filterParts.push(`audit_event.package_code = $${filterParams.length}`);
    }
    if (filters.organizationId) {
      const organizationId = Number(filters.organizationId);
      filterParams.push(organizationId);
      filterParts.push(`audit_event.organization_id = $${filterParams.length}`);
    }
    if (filters.entityType) {
      filterParams.push(filters.entityType);
      filterParts.push(`audit_event.entity_type = $${filterParams.length}`);
    }
    if (filters.entityCode) {
      filterParams.push(filters.entityCode);
      filterParts.push(`audit_event.entity_code = $${filterParams.length}`);
    }
    if (filters.entityId) {
      filterParams.push(filters.entityId);
      filterParts.push(`audit_event.entity_id = $${filterParams.length}`);
    }
    if (filters.mutationId) {
      filterParams.push(filters.mutationId);
      filterParts.push(`audit_event.mutation_id = $${filterParams.length}`);
    }
    if (filters.actorId) {
      filterParams.push(filters.actorId);
      filterParts.push(`(audit_event.actor_id = $${filterParams.length} OR actor_user.code = $${filterParams.length})`);
    }
    if (filters.dateFrom) {
      filterParams.push(filters.dateFrom);
      filterParts.push(`audit_event.creation_date >= $${filterParams.length}::timestamptz`);
    }
    if (filters.dateTo) {
      filterParams.push(filters.dateTo + "T23:59:59");
      filterParts.push(`audit_event.creation_date <= $${filterParams.length}::timestamptz`);
    }
    if (filters.search) {
      filterParams.push(`%${filters.search}%`);
      const n = filterParams.length;
      filterParts.push(`(audit_event.code ILIKE $${n} OR audit_event.package_code ILIKE $${n} OR audit_event.entity_type ILIKE $${n} OR audit_event.entity_code ILIKE $${n} OR audit_event.actor_id ILIKE $${n} OR actor_user.code ILIKE $${n})`);
    }

    const where = filterParts.length ? `WHERE ${filterParts.join(" AND ")}` : "";
    const sql = `
      SELECT audit_event.*, actor_user.code AS actor_code, actor_user.display_name AS actor_display_name, NULL::text AS organization_code
      FROM audit_event
      LEFT JOIN app_user actor_user ON actor_user.id::text = audit_event.actor_id
      ${where}
      ORDER BY audit_event.creation_date DESC, audit_event.id DESC
    `;
    const { rows } = await this.db.query(sql, filterParams);
    return rows.map((r: Record<string, unknown>) => this.mapEventRow(r));
  }

  async getEventById(id: number): Promise<(AuditEventRow & { changes: AuditChangeRow[] }) | null> {
    const { rows: eventRows } = await this.db.query(
      `SELECT audit_event.*, actor_user.code AS actor_code, actor_user.display_name AS actor_display_name, NULL::text AS organization_code
       FROM audit_event
       LEFT JOIN app_user actor_user ON actor_user.id::text = audit_event.actor_id
       WHERE audit_event.id = $1`,
      [id],
    );
    if (!eventRows[0]) return null;

    const event = this.mapEventRow(eventRows[0]);

    const { rows: changeRows } = await this.db.query(
      `SELECT * FROM audit_change WHERE audit_event_id = $1 ORDER BY id ASC`,
      [id],
    );

    return {
      ...event,
      changes: changeRows.map((r: Record<string, unknown>) => ({
        id: Number(r.id),
        audit_event_id: Number(r.audit_event_id),
        field_path: String(r.field_path),
        old_value: r.old_value,
        new_value: r.new_value,
      })),
    };
  }

  private parseCursor(cursor: string): { afterTs: string; afterId: number } | null {
    const match = cursor.match(/^ts:(.+)\|id:(\d+)$/);
    if (!match) return null;
    return { afterTs: match[1], afterId: Number(match[2]) };
  }

  private buildCursor(row: AuditEventRow): string {
    return `ts:${row.creation_date}|id:${row.id}`;
  }

  private mapEventRow(r: Record<string, unknown>): AuditEventRow {
    return {
      id: Number(r.id),
      code: String(r.code),
      package_code: String(r.package_code),
      organization_id: r.organization_id != null ? Number(r.organization_id) : null,
      organization_code: r.organization_code != null ? String(r.organization_code) : null,
      actor_type: r.actor_type == null ? null : String(r.actor_type) as ActorType,
      actor_id: r.actor_id != null ? String(r.actor_id) : null,
      actor_code: r.actor_code != null ? String(r.actor_code) : null,
      actor_display_name: r.actor_display_name != null ? String(r.actor_display_name) : null,
      action: String(r.action),
      entity_type: String(r.entity_type),
      entity_id: String(r.entity_id),
      entity_code: r.entity_code != null ? String(r.entity_code) : null,
      mutation_id: r.mutation_id != null ? String(r.mutation_id) : null,
      creation_date: r.creation_date instanceof Date
        ? r.creation_date.toISOString()
        : String(r.creation_date),
    };
  }
}

