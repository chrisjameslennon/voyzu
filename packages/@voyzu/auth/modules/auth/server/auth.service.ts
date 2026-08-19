import { getDb } from "@voyzu/capability/db";
import { UnauthorizedError } from "@voyzu/capability/errors";
import { verifyPassword } from "../../users/server/lib/password-hash";

interface AuthenticatedUser {
  id: number;
  code: string;
  displayName: string;
  role: string;
}

interface AuthUserRow {
  id: number;
  code: string;
  email: string | null;
  display_name: string;
  password_hash: string;
  role: string;
  status: string;
}

function mapAuthUser(row: Record<string, unknown>): AuthUserRow {
  return {
    id: Number(row.id),
    code: String(row.code),
    email: row.email == null ? null : String(row.email),
    display_name: String(row.display_name),
    password_hash: String(row.password_hash),
    role: String(row.role),
    status: String(row.status),
  };
}

export async function authenticateUser(identifier: string, password: string): Promise<AuthenticatedUser> {
  const login = identifier.trim();
  const { rows } = await getDb().query(
    `SELECT id, code, email, display_name, password_hash, role, status
     FROM app_user
     WHERE LOWER(code) = LOWER($1) OR LOWER(email) = LOWER($1)
     ORDER BY CASE WHEN LOWER(code) = LOWER($1) THEN 0 ELSE 1 END
     LIMIT 1`,
    [login],
  );
  const row = rows[0] ? mapAuthUser(rows[0]) : null;

  if (!row || row.status !== "ACTIVE" || !(await verifyPassword(password, row.password_hash))) {
    throw new UnauthorizedError("Invalid email, user code, or password");
  }

  return {
    id: row.id,
    code: row.code,
    displayName: row.display_name,
    role: row.role,
  };
}
