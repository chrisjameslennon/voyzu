import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import {
  countAuditEvents,
  exportAuditEvents,
  getAuditEvent,
  listAuditEvents,
} from "@voyzu/audit/audit/operations";
import { getDb, getPool } from "@voyzu/capability/db";

const packageCode = "@voyzu/operations-test";
let eventId: number;

before(async () => {
  const { rows } = await getDb().query(
    `INSERT INTO audit_event (package_code, actor_type, actor_id, action, entity_type, entity_id, entity_code, mutation_id)
     VALUES ($1, 'SYSTEM', 'operations-test', 'INSERT', 'operations_test', '1', 'OPTEST', 'operations-test')
     RETURNING id`,
    [packageCode],
  );
  eventId = Number(rows[0].id);
  await getDb().query(
    "INSERT INTO audit_change (audit_event_id, field_path, new_value) VALUES ($1, 'code', $2::jsonb)",
    [eventId, JSON.stringify("OPTEST")],
  );
});

after(async () => {
  await getDb().query("DELETE FROM audit_change WHERE audit_event_id = $1", [eventId]);
  await getDb().query("DELETE FROM audit_event WHERE id = $1", [eventId]);
  await getPool().end();
});

test("countAuditEvents returns the platform audit count", async () => {
  assert.ok(await countAuditEvents() >= 1);
});

test("listAuditEvents filters through the public operation", async () => {
  const result = await listAuditEvents({ packageCode });
  assert.equal(result.totalMatching, 1);
  assert.equal(result.items[0]?.id, eventId);
});

test("exportAuditEvents returns the complete filtered result", async () => {
  const result = await exportAuditEvents({ packageCode });
  assert.deepEqual(result.map(({ id }) => id), [eventId]);
});

test("getAuditEvent returns an event and its changes", async () => {
  const result = await getAuditEvent(eventId);
  assert.equal(result?.id, eventId);
  assert.equal(result?.changes[0]?.fieldPath, "code");
});
