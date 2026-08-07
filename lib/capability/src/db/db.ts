import { Pool, type PoolClient, type QueryResult } from "pg";

import {
  parsePostgresError,
  validateDatabaseUrl,
  type DatabaseUrlValidationResult,
} from "./util";

let pool: Pool | null = null;
let db: DbExecutor | null = null;
let databaseUrlValidation: DatabaseUrlValidationResult | null = null;

export type DbExecutor = {
  query: (text: string, params?: unknown[]) => Promise<QueryResult<Record<string, unknown>>>;
};

function getDatabaseUrlValidation(): DatabaseUrlValidationResult {
  databaseUrlValidation ??= validateDatabaseUrl();
  return databaseUrlValidation;
}

function isPostgresError(error: unknown): error is Error & { code?: string } {
  if (!(error instanceof Error)) return false;

  const code = (error as { code?: unknown }).code;

  return (
    typeof code === "string" ||
    error.message.includes("SCRAM-SERVER-FIRST-MESSAGE") ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("ENOTFOUND")
  );
}

export function normalizeDbError(error: unknown): unknown {
  if (!isPostgresError(error)) return error;

  const validation = getDatabaseUrlValidation();

  return parsePostgresError(error, {
    hasPassword: validation.hasPassword,
    hasSocketHost: validation.hasSocketHost,
  });
}

export function getPool(): Pool {
  if (!pool) {
    const validation = getDatabaseUrlValidation();

    pool = new Pool({
      connectionString: validation.databaseUrl,
    });

    pool.on("error", (error) => {
      console.error(
        "Unexpected idle database client error",
        parsePostgresError(error, {
          hasPassword: validation.hasPassword,
          hasSocketHost: validation.hasSocketHost,
        }),
      );
    });
  }

  return pool;
}

export function getDb(): DbExecutor {
  db ??= {
    async query(text, params) {
      try {
        return await getPool().query(text, params);
      } catch (error) {
        throw normalizeDbError(error);
      }
    },
  };

  return db;
}

export async function withTransaction<T>(
  fn: (client: DbExecutor) => Promise<T>,
): Promise<T> {
  let client: PoolClient;

  try {
    client = await getPool().connect();
  } catch (error) {
    const validation = getDatabaseUrlValidation();

    throw parsePostgresError(error, {
      hasPassword: validation.hasPassword,
      hasSocketHost: validation.hasSocketHost,
    });
  }

  try {
    await client.query("BEGIN");

    let queryQueue = Promise.resolve();
    const transactionDb: DbExecutor = {
      query(text, params) {
        const nextQuery = queryQueue.then(() => client.query(text, params));
        queryQueue = nextQuery.then(
          () => undefined,
          () => undefined,
        );
        return nextQuery;
      },
    };

    const result = await fn(transactionDb);
    await queryQueue;

    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback failure
    }
    throw normalizeDbError(error);
  } finally {
    client.release();
  }
}
