import { getDb } from "@voyzu/capability/db";

/** Internal configuration access; user-facing handlers enforce their management permissions. */
export const settingsMethods = {
  async get({ code }: { code: string }) {
    const { rows } = await getDb().query("SELECT code, value FROM voyzu_settings WHERE code = $1", [code]);
    return rows[0] ? { code: String(rows[0].code), value: String(rows[0].value) } : null;
  },
  async set({ code, value }: { code: string; value: string }) {
    await getDb().query(`INSERT INTO voyzu_settings (code, value) VALUES ($1, $2)
      ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value`, [code, value]);
  },
};
