# Authentication

Voyzu provides one request identity model for the web application and external API callers. Packages use the authenticated user supplied by the platform; they do not implement their own login state, cookies, Basic authentication parsing, or request identity context.

## API authentication

External API calls use HTTP Basic authentication. The username is the Voyzu user code and the password is that user's password. The user must be active and their access mode must allow API access.

Construct the credentials as one exact text value:

```text
USER_CODE:PASSWORD
```

The colon is mandatory and there must be no spaces around it. Base64-encode that entire value—including the user code, the colon, and the password. Do not encode only the password and do not encode the two parts separately.

```shell
curl --request GET \
  --url http://localhost:3000/api/organization/organizations \
  --header 'Authorization: Basic BASE64_OF_USER_CODE_COLON_PASSWORD'
```

For example, first construct this exact unencoded value:

```text
API_USER:passwordpassword
```

The Base64 encoding of that complete value is:

```text
QVBJX1VTRVI6cGFzc3dvcmRwYXNzd29yZA==
```

and can be sent as:

```shell
curl --request GET \
  --url http://localhost:3000/api/organization/organizations \
  --header 'Authorization: Basic QVBJX1VTRVI6cGFzc3dvcmRwYXNzd29yZA=='
```

Invalid or inactive credentials return `401 Unauthorized`. If an `Authorization` header is supplied but is invalid, Voyzu does not fall back to browser-session authentication.

## Application authentication

The same API endpoint may receive an external request or a request from the Voyzu web application. External callers supply Basic credentials. When no `Authorization` header is present, Voyzu attempts to authenticate the signed-in browser through its session cookie.

This allows browser code to call Voyzu APIs normally after the user signs in, while scripts, integrations, test clients, and other external systems use Basic authentication. An endpoint requiring a user returns `401 Unauthorized` if neither method establishes an identity.

The shared handler used by each generated API route installs the authenticated user in the request context before invoking a package handler. Services can therefore use the same current-user and audit helpers for application and API requests:

```ts
import { getCurrentUser } from "@voyzu/auth/users/server";

const user = await getCurrentUser();
if (!user) {
  throw new Error("An authenticated user is required");
}
```

API requests are recorded with the API actor type. Packages must not parse authentication headers or construct their own request identity context.

## UI sessions

The login page posts the supplied identifier and password to `POST /api/auth/session`. A successful login creates a signed `voyzu_auth` cookie with these properties:

- HTTP only, so client JavaScript cannot read it.
- Secure and available across the application.
- `SameSite=Lax`.
- An eight-hour lifetime.

The cookie identifies the user and session expiry. On authenticated application requests, `getCurrentUser()` reloads the platform user record from the database. Deactivation, role changes and access-mode changes therefore take effect without waiting for the cookie to expire. Business packages load their own scope assignments at their perimeter.

The installer generates a strong private `VOYZU_AUTH_SECRET` for each installation. Preserve it in every deployed environment. Voyzu refuses to create or verify sessions when the value is missing or decodes to fewer than 32 bytes. Changing the secret invalidates existing UI sessions.

Logging out through `DELETE /api/auth/session` expires the cookie. Packages must not implement module-specific login state, session cookies, or logout behavior.

## Protect application pages

Authentication and minimum role requirements belong on the page route registered by the package module:

```ts
// packages/@acme/inventory/modules/items/pages.routes.ts
export const pageRoutes = {
  list: {
    id: "acme.inventory-items.page.list",
    path: "/inventory/items",
    pageTitle: "Inventory items",
    Page: InventoryItemsListPage,
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

For a protected page, the application surface:

- redirects an unauthenticated user to login;
- preserves the intended destination in the `next` query parameter; and
- renders access denied when an authenticated user does not meet the minimum role.

Page-route protection controls entry to the UI. API handlers and services must still enforce their own authorization and business rules. Never treat the presence of a session cookie, an API credential, a route parameter, or a request value as sufficient permission to access a record.

## Package rules

- Use the platform route `auth` declaration for protected pages.
- Use `getCurrentUser()` when server-side behavior needs the current identity.
- Allow the platform API router to establish request identity.
- Keep authentication separate from organization selection and other business context.
- Apply service-level authorization independently of UI visibility.
- Do not decode `voyzu_auth`, parse Basic authentication, or create package-specific authentication cookies.
