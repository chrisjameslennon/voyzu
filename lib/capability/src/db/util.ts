import { Pool } from "pg";

import { DatabaseError } from "../errors";

export type DatabaseUrlValidationResult = {
  databaseUrl: string;
  parsed: URL;
  hasPassword: boolean;
  hasHost: boolean;
  hasSocketHost: boolean;
};

type PgLikeError = Error & {
  code?: string;
  constraint?: string;
};

export function parsePostgresTextArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value == null) return [];
  if (typeof value !== "string") return [];
  if (value === "{}") return [];
  if (!value.startsWith("{") || !value.endsWith("}")) return [];

  const items: string[] = [];
  let current = "";
  let inQuotes = false;
  let escaping = false;

  for (let i = 1; i < value.length - 1; i += 1) {
    const char = value[i];

    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      items.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  items.push(current);
  return items.filter((item) => item.length > 0 && item !== "NULL");
}

function postgresCodeLabel(pgErr: PgLikeError): string {
  return pgErr.code ? ` [${pgErr.code}]` : "";
}

export function validateDatabaseUrl(
  databaseUrl = process.env.VOYZU_DATABASE_URL,
): DatabaseUrlValidationResult {
  if (!databaseUrl || databaseUrl.trim() === "") {
    throw new DatabaseError(
      "Database is not configured. Set VOYZU_DATABASE_URL in your environment.",
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new DatabaseError("VOYZU_DATABASE_URL is not a valid URL.");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new DatabaseError(
      "VOYZU_DATABASE_URL must start with postgres:// or postgresql://.",
    );
  }

  const userFromUrl = parsed.username;
  const userFromQuery = parsed.searchParams.get("user");

  if (!userFromUrl && !userFromQuery) {
    throw new DatabaseError("VOYZU_DATABASE_URL is missing a database username.");
  }

  const hostFromUrl = parsed.hostname;
  const hostFromQuery = parsed.searchParams.get("host");

  if (!hostFromUrl && !hostFromQuery) {
    throw new DatabaseError(
      "VOYZU_DATABASE_URL is missing a database host. For socket connections, provide host as a query parameter.",
    );
  }

  if (!parsed.pathname || parsed.pathname === "/") {
    throw new DatabaseError("VOYZU_DATABASE_URL is missing a database name.");
  }

  return {
    databaseUrl,
    parsed,
    hasPassword: parsed.password.length > 0 || Boolean(parsed.searchParams.get("password")),
    hasHost: Boolean(hostFromUrl),
    hasSocketHost: Boolean(hostFromQuery && hostFromQuery.startsWith("/")),
  };
}

export function parsePostgresError(
  err: unknown,
  context?: {
    hasPassword?: boolean;
    hasSocketHost?: boolean;
  },
): DatabaseError {
  if (!(err instanceof Error)) {
    return new DatabaseError("Unknown database connection error.");
  }

  const pgErr = err as PgLikeError;
  const message = err.message;

  switch (pgErr.code) {
    case "28P01":
      return new DatabaseError(
        "Database login failed. Check the username and password in VOYZU_DATABASE_URL.",
      );
    case "3D000":
      return new DatabaseError(
        "Database connection failed. The database name in VOYZU_DATABASE_URL does not exist.",
      );
    case "28000":
      return new DatabaseError("Database login failed. The database user does not have access.");
    case "ECONNREFUSED":
      return new DatabaseError(
        context?.hasSocketHost
          ? "Database connection failed. Check that Postgres is running and that the socket path in VOYZU_DATABASE_URL is correct."
          : "Database connection failed. Check that Postgres is running and the host/port are correct.",
      );
    case "ENOTFOUND":
      return new DatabaseError("Database host could not be found. Check the host name in VOYZU_DATABASE_URL.");
  }

  if (pgErr.code?.startsWith("23")) {
    const constraint = pgErr.constraint ? ` (${pgErr.constraint})` : "";
    return new DatabaseError(`Database constraint failed${constraint}${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("22")) {
    return new DatabaseError(`Database data error${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("40")) {
    return new DatabaseError(`Database transaction failed${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("42")) {
    return new DatabaseError(`Database query is invalid${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("53")) {
    return new DatabaseError(`Database resources are unavailable${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("55")) {
    return new DatabaseError(`Database object is not in the required state${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("57")) {
    return new DatabaseError(`Database operation was interrupted${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (pgErr.code?.startsWith("58")) {
    return new DatabaseError(`Database system error${postgresCodeLabel(pgErr)}. ${message}`);
  }

  if (message.includes("SCRAM-SERVER-FIRST-MESSAGE: client password must be a string")) {
    if (context?.hasPassword === false) {
      return new DatabaseError(
        "Database login failed. Postgres appears to require password authentication, but VOYZU_DATABASE_URL does not include a password.",
      );
    }

    return new DatabaseError(
      "Database login failed. The database password could not be read correctly from VOYZU_DATABASE_URL. Check that special characters are URL-encoded.",
    );
  }

  if (message.includes("SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string")) {
    return new DatabaseError("Database login failed. VOYZU_DATABASE_URL includes an empty password.");
  }

  if (message.includes("SCRAM-SERVER-FIRST-MESSAGE")) {
    return new DatabaseError(
      "Database SCRAM authentication failed. Check VOYZU_DATABASE_URL, username, password, and Postgres authentication settings.",
    );
  }

  if (message.includes("ECONNREFUSED")) {
    return new DatabaseError(
      context?.hasSocketHost
        ? "Database connection failed. Check that Postgres is running and that the socket path in VOYZU_DATABASE_URL is correct."
        : "Database connection failed. Check that Postgres is running and the host/port are correct.",
    );
  }

  if (message.includes("ENOTFOUND")) {
    return new DatabaseError("Database host could not be found. Check the host name in VOYZU_DATABASE_URL.");
  }

  if (message.includes("no such file or directory")) {
    return new DatabaseError(
      "Database connection failed. The Postgres socket file could not be found. Check that Postgres is running and that the socket path in VOYZU_DATABASE_URL is correct.",
    );
  }

  return new DatabaseError(`Database query failed${postgresCodeLabel(pgErr)}. ${message}`);
}

export async function validateDatabaseConnection(): Promise<void> {
  const validation = validateDatabaseUrl();
  const pool = new Pool({
    connectionString: validation.databaseUrl,
    connectionTimeoutMillis: 3000,
  });

  try {
    await pool.query("SELECT 1");
  } catch (err) {
    throw parsePostgresError(err, {
      hasPassword: validation.hasPassword,
      hasSocketHost: validation.hasSocketHost,
    });
  } finally {
    await pool.end();
  }
}
