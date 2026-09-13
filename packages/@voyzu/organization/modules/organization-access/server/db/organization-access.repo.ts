import type { DbExecutor } from "@voyzu/capability/db";

export class OrganizationAccessRepo {
  constructor(private readonly db: DbExecutor) {}

  async listOrganizationIdsByUser(): Promise<Map<number, number[]>> {
    const { rows } = await this.db.query(
      `SELECT user_id, organization_id
       FROM organization_user_access
       ORDER BY user_id, organization_id`,
    );
    const result = new Map<number, number[]>();
    for (const row of rows) {
      const userId = Number(row.user_id);
      const organizationIds = result.get(userId) ?? [];
      organizationIds.push(Number(row.organization_id));
      result.set(userId, organizationIds);
    }
    return result;
  }

  async listOrganizationIdsForUser(userId: number): Promise<number[]> {
    const { rows } = await this.db.query(
      `SELECT organization_id
       FROM organization_user_access
       WHERE user_id = $1
       ORDER BY organization_id`,
      [userId],
    );
    return rows.map((row) => Number(row.organization_id));
  }

  async replace(userId: number, organizationIds: number[]): Promise<void> {
    await this.db.query("DELETE FROM organization_user_access WHERE user_id = $1", [userId]);
    for (const organizationId of organizationIds) {
      await this.db.query(
        `INSERT INTO organization_user_access (user_id, organization_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, organization_id) DO NOTHING`,
        [userId, organizationId],
      );
    }
  }

  async existingOrganizationIds(organizationIds: number[]): Promise<Set<number>> {
    if (organizationIds.length === 0) return new Set();
    const { rows } = await this.db.query(
      `SELECT id FROM organization
       WHERE id = ANY($1::bigint[])
         AND status != 'DELETED'`,
      [organizationIds],
    );
    return new Set(rows.map((row) => Number(row.id)));
  }
}
