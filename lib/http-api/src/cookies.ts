/** Cookie policy is shared by HTTP handlers and server actions. */
export const httpCookiePolicy = {
  secure: true,
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export const httpCookieDefinitions = {
  authentication: { name: "voyzu_auth", maxAgeSeconds: 60 * 60 * 8 },
  selectedOrganization: { name: "voyzuSelectedOrganizationId", maxAgeSeconds: 60 * 60 * 24 * 365 },
} as const;

type CookieDefinition = { readonly name: string; readonly maxAgeSeconds?: number };
type CookieWriter = { set(name: string, value: string, options: typeof httpCookiePolicy & { maxAge?: number }): unknown };

export function setHttpCookie(store: CookieWriter, definition: CookieDefinition, value: string): void {
  store.set(definition.name, value, { ...httpCookiePolicy, ...(definition.maxAgeSeconds === undefined ? {} : { maxAge: definition.maxAgeSeconds }) });
}

export function clearHttpCookie(store: CookieWriter, definition: CookieDefinition): void {
  store.set(definition.name, "", { ...httpCookiePolicy, maxAge: 0 });
}
