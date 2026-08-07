import { Buffer } from "node:buffer";

export const AUTH_COOKIE_NAME = "voyzu_auth";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 8;

interface AuthSessionPayload {
  userId: number;
  code: string;
  displayName: string;
  role: string;
  exp: number;
}

export interface AuthSession {
  userId: number;
  code: string;
  displayName: string;
  role: string;
  expiresAt: number;
}

export interface CreateAuthSessionInput {
  userId: number;
  code: string;
  displayName: string;
  role: string;
}

export const authCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: DEFAULT_MAX_AGE_SECONDS,
};

export function getAuthSecret(): Buffer {
  const encodedSecret = process.env.VOYZU_AUTH_SECRET;

  if (!encodedSecret) {
    throw new Error(
      "VOYZU_AUTH_SECRET is required. Run the Voyzu installer or configure it in the deployment environment.",
    );
  }

  const secret = Buffer.from(encodedSecret, "base64url");

  if (secret.length < 32) {
    throw new Error(
      "VOYZU_AUTH_SECRET must contain at least 32 bytes of cryptographically random data.",
    );
  }

  return secret;
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new Uint8Array(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string): Promise<string> {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createAuthSessionToken(input: CreateAuthSessionInput): Promise<string> {
  const payload: AuthSessionPayload = {
    userId: input.userId,
    code: input.code,
    displayName: input.displayName,
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + DEFAULT_MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAuthSessionToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await sign(encodedPayload);
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthSessionPayload;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return {
      userId: payload.userId,
      code: payload.code,
      displayName: payload.displayName,
      role: payload.role,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}
