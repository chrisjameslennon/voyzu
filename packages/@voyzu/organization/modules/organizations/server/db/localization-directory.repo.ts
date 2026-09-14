import { getDb } from "@voyzu/capability/db";

export async function listCountryDirectory() {
  const { rows } = await getDb().query("SELECT code, name, currency_code, status FROM country WHERE status != 'DELETED' ORDER BY code");
  return rows.map(row => ({ code: String(row.code), name: String(row.name), currencyCode: String(row.currency_code), status: String(row.status) }));
}

export async function listCurrencyDirectory() {
  const { rows } = await getDb().query("SELECT code, name, symbol, status FROM currency WHERE status != 'DELETED' ORDER BY code");
  return rows.map(row => ({ code: String(row.code), name: String(row.name), symbol: String(row.symbol), status: String(row.status) }));
}
