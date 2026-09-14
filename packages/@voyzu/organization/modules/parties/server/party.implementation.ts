import { getDb } from "@voyzu/capability/db";
import { NotFoundError } from "@voyzu/capability/errors";
import type { Party, PartyMethods } from "@voyzu/types/business-objects/party";

export const partyMethods = {
  async get(input) {
    const byId = "party_id" in input;
    const { rows } = await getDb().query(
      `SELECT id::int AS party_id, code, name FROM party WHERE ${byId ? "id" : "code"} = $1`,
      [byId ? input.party_id : input.code],
    );
    return (rows[0] as Party | undefined) ?? null;
  },
  async create({ code, name }) {
    const { rows } = await getDb().query(
      "INSERT INTO party (code, name) VALUES ($1, $2) RETURNING id::int AS party_id, code, name",
      [code, name],
    );
    return rows[0] as Party;
  },
  async update({ party_id, changes }) {
    const { rows } = await getDb().query(
      "UPDATE party SET code = COALESCE($2, code), name = COALESCE($3, name) WHERE id = $1 RETURNING id",
      [party_id, changes.code ?? null, changes.name ?? null],
    );
    if (!rows.length) throw new NotFoundError("Party not found");
  },
} satisfies PartyMethods;
