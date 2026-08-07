import type { ActorType } from "@voyzu/types/modules/core";
import type { DbExecutor } from "@voyzu/capability/db";
import { DataError } from "@voyzu/capability/errors";
import type { UserAssignmentRow, UserRow } from "./user.row.types";

const USER_COLUMNS = [
  "id",
  "code",
  "email",
  "display_name",
  "password_hash",
  "role",
  "access_mode",
  "show_developer_links",
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

const MUTABLE_COLUMNS = ["code", "email", "display_name", "role", "access_mode", "show_developer_links", "status"];

export interface UserAuditStamp {
  actorType: ActorType;
  userId: number | null;
  mutationId: string;
}

export class UserRepo {
  constructor(private readonly db: DbExecutor) {}

  async list(): Promise<UserRow[]> {
    const { rows } = await this.db.query(
      `SELECT * FROM app_user ORDER BY code ASC`,
    );
    return rows.map((row: Record<string, unknown>) => this.mapUser(row));
  }

  async get(code: string): Promise<UserRow | null> {
    const { rows } = await this.db.query(
      `SELECT * FROM app_user WHERE code = $1`,
      [code],
    );
    return rows[0] ? this.mapUser(rows[0]) : null;
  }

  async getById(id: number): Promise<UserRow | null> {
    const { rows } = await this.db.query(
      `SELECT * FROM app_user WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapUser(rows[0]) : null;
  }

  async countActiveAdmins(): Promise<number> {
    const { rows } = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM app_user WHERE role = 'ADMIN' AND status = 'ACTIVE'`,
    );
    return Number(rows[0]?.count ?? 0);
  }

  async batchGet(codes: string[]): Promise<UserRow[]> {
    if (codes.length === 0) return [];
    const { rows } = await this.db.query(
      `SELECT * FROM app_user WHERE code = ANY($1::text[]) ORDER BY code ASC`,
      [codes],
    );
    return rows.map((row: Record<string, unknown>) => this.mapUser(row));
  }

  async insert(row: {
    code: string;
    email: string | null;
    display_name: string;
    password_hash: string;
    role: string;
    access_mode: string;
    show_developer_links: boolean;
    status: string;
    audit?: UserAuditStamp;
  }): Promise<UserRow> {
    const { rows } = await this.db.query(
      `INSERT INTO app_user (
         code, email, display_name, password_hash, role, access_mode, show_developer_links, status,
         creation_actor_type, creation_user_id, creation_mutation_id, updated_actor_type, updated_user_id, updated_mutation_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::uuid, $9, $10, $11::uuid)
       RETURNING *`,
      [
        row.code,
        row.email,
        row.display_name,
        row.password_hash,
        row.role,
        row.access_mode,
        row.show_developer_links,
        row.status,
        row.audit?.actorType ?? "SYSTEM",
        row.audit?.userId == null ? null : String(row.audit.userId),
        row.audit?.mutationId ?? null,
      ],
    );
    return this.mapUser(rows[0]);
  }

  async update(code: string, row: {
    code: string;
    email: string | null;
    display_name: string;
    role: string;
    access_mode: string;
    show_developer_links: boolean;
    status: string;
    audit?: UserAuditStamp;
  }): Promise<UserRow> {
    const vals: unknown[] = [];
    const sets = MUTABLE_COLUMNS.map((column) => {
      vals.push((row as unknown as Record<string, unknown>)[column]);
      return `${column} = $${vals.length}`;
    });
    vals.push(row.audit?.actorType ?? "SYSTEM");
    sets.push(`updated_actor_type = $${vals.length}`);
    vals.push(row.audit?.userId == null ? null : String(row.audit.userId));
    sets.push(`updated_user_id = $${vals.length}`);
    vals.push(row.audit?.mutationId ?? null);
    sets.push(`updated_mutation_id = $${vals.length}::uuid`);
    vals.push(code);
    const { rows } = await this.db.query(
      `UPDATE app_user SET ${sets.join(", ")}, updated_date = NOW()
       WHERE code = $${vals.length}
       RETURNING *`,
      vals,
    );
    if (!rows[0]) throw new DataError(`User ${code} not found`);
    return this.mapUser(rows[0]);
  }

  async delete(code: string): Promise<void> {
    await this.db.query(`DELETE FROM app_user WHERE code = $1`, [code]);
  }

  async batchDelete(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    await this.db.query(`DELETE FROM app_user WHERE code = ANY($1::text[])`, [codes]);
  }

  async batchUpdateStatus(codes: string[], status: "ACTIVE" | "INACTIVE", audit?: UserAuditStamp): Promise<UserRow[]> {
    if (codes.length === 0) return [];
    const { rows } = await this.db.query(
      `UPDATE app_user
       SET status = $2, updated_date = NOW(), updated_actor_type = $3, updated_user_id = $4, updated_mutation_id = $5::uuid
       WHERE code = ANY($1::text[])
       RETURNING *`,
      [codes, status, audit?.actorType ?? "SYSTEM", audit?.userId == null ? null : String(audit.userId), audit?.mutationId ?? null],
    );
    return rows.map((row: Record<string, unknown>) => this.mapUser(row));
  }

  async updatePassword(code: string, passwordHash: string, audit?: UserAuditStamp): Promise<UserRow> {
    const { rows } = await this.db.query(
      `UPDATE app_user
       SET password_hash = $2, updated_date = NOW(), updated_actor_type = $3, updated_user_id = $4, updated_mutation_id = $5::uuid
       WHERE code = $1
       RETURNING *`,
      [code, passwordHash, audit?.actorType ?? "SYSTEM", audit?.userId == null ? null : String(audit.userId), audit?.mutationId ?? null],
    );
    if (!rows[0]) throw new DataError(`User ${code} not found`);
    return this.mapUser(rows[0]);
  }

  async listAssignments(userId: number): Promise<UserAssignmentRow[]> {
    if (!(await this.companyAssignmentsAvailable())) return [];
    const { rows } = await this.db.query(
      `SELECT a.id, a.user_id, a.company_id, c.code AS company_code, c.name AS company_name
       FROM app_user_assignment a
       JOIN company c ON c.id = a.company_id
       WHERE a.user_id = $1
       ORDER BY c.code ASC`,
      [userId],
    );
    return rows.map((row: Record<string, unknown>) => this.mapAssignment(row));
  }

  async replaceAssignments(userId: number, companyIds: number[]): Promise<void> {
    if (!(await this.companyAssignmentsAvailable())) {
      if (companyIds.length === 0) return;
      throw new DataError("Company access is unavailable because no company package is installed");
    }
    await this.db.query(`DELETE FROM app_user_assignment WHERE user_id = $1`, [userId]);
    for (const companyId of companyIds) {
      await this.db.query(
        `INSERT INTO app_user_assignment (user_id, company_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, company_id) DO NOTHING`,
        [userId, companyId],
      );
    }
  }

  private async companyAssignmentsAvailable(): Promise<boolean> {
    const { rows } = await this.db.query(
      `SELECT to_regclass('public.app_user_assignment') IS NOT NULL
              AND to_regclass('public.company') IS NOT NULL AS available`,
    );
    return rows[0]?.available === true;
  }

  private mapUser(row: Record<string, unknown>): UserRow {
    const mapped: Record<string, unknown> = {};
    for (const column of USER_COLUMNS) mapped[column] = row[column];
    return {
      id: Number(mapped.id),
      code: String(mapped.code),
      email: mapped.email == null ? null : String(mapped.email),
      display_name: String(mapped.display_name),
      password_hash: String(mapped.password_hash),
      role: String(mapped.role),
      access_mode: String(mapped.access_mode),
      show_developer_links: Boolean(mapped.show_developer_links),
      status: String(mapped.status),
      creation_date: mapped.creation_date instanceof Date ? mapped.creation_date.toISOString() : String(mapped.creation_date),
      creation_actor_type: String(mapped.creation_actor_type) as ActorType,
      creation_user_id: mapped.creation_user_id == null ? null : String(mapped.creation_user_id),
      creation_mutation_id: mapped.creation_mutation_id == null ? null : String(mapped.creation_mutation_id),
      updated_date: mapped.updated_date instanceof Date ? mapped.updated_date.toISOString() : String(mapped.updated_date),
      updated_actor_type: String(mapped.updated_actor_type) as ActorType,
      updated_user_id: mapped.updated_user_id == null ? null : String(mapped.updated_user_id),
      updated_mutation_id: mapped.updated_mutation_id == null ? null : String(mapped.updated_mutation_id),
    };
  }

  private mapAssignment(row: Record<string, unknown>): UserAssignmentRow {
    return {
      id: Number(row.id),
      user_id: Number(row.user_id),
      company_id: Number(row.company_id),
      company_code: String(row.company_code),
      company_name: String(row.company_name),
    };
  }
}
