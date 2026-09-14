import { getDb } from "@voyzu/capability/db";
import { NotFoundError } from "@voyzu/capability/errors";
import type { Party, PartyMethods } from "@voyzu/types/business-objects/party";
import { createUpdateAuditStamp } from "@voyzu/capability/audit";
import { createParty } from "./lib/party.service";

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
    const party = await createParty({ code, name });
    return { party_id: party.id, code: party.code, name: party.name };
  },
  async update({ party_id, changes }) {
    const audit = await createUpdateAuditStamp();
    const { rows } = await getDb().query(
      `UPDATE party SET code = COALESCE($2, code), name = COALESCE($3, name),
       updated_date = $4, updated_actor_type = $5, updated_user_id = $6, updated_mutation_id = $7
       WHERE id = $1 RETURNING id`,
      [party_id, changes.code ?? null, changes.name ?? null, audit.timestamp, audit.actorType, audit.userId, audit.mutationId],
    );
    if (!rows.length) throw new NotFoundError("Party not found");
  },
} satisfies PartyMethods;
