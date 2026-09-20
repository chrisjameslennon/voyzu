# Authentication package documentation

**Package:** `@voyzu/authentication`  

> Proposed package shape based on the current capability / semantic-contract architecture.

## Implements Semantic Contracts

### @core/auth

Authentication and authorization runtime capability. This contract has no resource-level `dataDefinition`; it exposes behaviour only.

The package depends on the Users capability for user identity. It does not read the Users package tables directly. Cross-package user access goes through the `@core/user` Internal API contract.

#### Methods

```ts
import type { User } from "@voyzu/semantic-contracts/user";

export interface AuthenticationContext {
  authenticated: boolean;
  actorType: "USER" | "API" | "SYSTEM";
  user: User | null;
  permissions: string[];
}

export interface AuthenticationMethods {
  /**
   * Returns the authentication context for the current execution.
   *
   * For an HTTP request, the implementation typically resolves the current
   * session from the request context supplied by Platform.
   */
  get(): Promise<AuthenticationContext>;

  /**
   * Verifies credentials, creates a session and writes the session cookie
   * through the runtime context supplied by Platform.
   */
  login(parameters: {
    email: string;
    password: string;
  }): Promise<AuthenticationContext>;

  /**
   * Invalidates the current session and removes the session cookie.
   */
  logout(): Promise<void>;

  /**
   * Returns whether the current actor has a permission in the supplied
   * optional business context.
   *
   * This is useful to callers that need to decide what functionality to show.
   * Server-side operations must still enforce their own authorization.
   */
  can(parameters: {
    permission: string;
    organizationId?: number;
  }): Promise<{ allowed: boolean }>;

  /**
   * Enforces a permission for the current actor.
   *
   * Returns normally when allowed. The implementation throws an authorization
   * error when the actor is not permitted.
   */
  authorize(parameters: {
    permission: string;
    organizationId?: number;
  }): Promise<void>;
}

export interface AuthenticationContract {
  methods: AuthenticationMethods;
}
```

There is intentionally no `identifier`, `dataDefinition` or resource relationship block. Authentication is a methods-only semantic contract.

`AuthenticationContext.user` uses the shared `User` semantic type rather than declaring an Authentication-owned user shape.

## Package dependencies

```text
@voyzu/authentication
    dependsOn
        @voyzu/users
```

Authentication depends on Users because a session ultimately resolves to a User identity.

Users does not depend on Authentication.

```text
@voyzu/users
    User identity and lifecycle
          ▲
          │ dependsOn
          │
@voyzu/authentication
    credentials, sessions,
    authentication and authorization
```

The Voyzu Platform is not represented as an ordinary package dependency. All Voyzu packages run inside the Platform runtime.

Authentication does, however, make direct use of runtime primitives supplied by Platform through interfaces defined by `@voyzu/foundation`.

## Platform runtime integration

Authentication must participate in the request lifecycle to read and write session cookies. It should not import Platform implementation code or Next.js request APIs directly.

Foundation defines the runtime interfaces:

```ts
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAgeSeconds?: number;
}

export interface CookieStore {
  get(name: string): string | undefined;

  set(
    name: string,
    value: string,
    options?: CookieOptions,
  ): void;

  delete(name: string): void;
}

export interface RequestContext {
  cookies: CookieStore;
}

export interface CapabilityContext {
  /**
   * Request-scoped infrastructure supplied by Platform.
   */
  request: RequestContext;

  /**
   * Initialized Internal API invoker supplied by Platform.
   */
  internalApi: InternalApiInvoker;

  /**
   * Database access supplied by the Voyzu runtime.
   */
  db: DbAccessor;
}
```

Platform creates the concrete context for the current execution and passes it to the Authentication implementation.

Conceptually:

```text
HTTP request
    ↓
Voyzu Platform
    creates CapabilityContext
      - cookies
      - Internal API invoker
      - database access
    ↓
calls @voyzu/authentication
```

Authentication receives the context; it does not reach upward into Platform.

### Example implementation

```ts
import type { CapabilityContext } from "@voyzu/foundation";
import type {
  AuthenticationMethods,
  AuthenticationContext,
} from "@voyzu/semantic-contracts/authentication";

const SESSION_COOKIE = "voyzu_session";

export function createAuthenticationMethods(
  context: CapabilityContext,
): AuthenticationMethods {
  return {
    async get(): Promise<AuthenticationContext> {
      // Platform supplied the request cookie interface.
      // Authentication does not import Next.js cookies() directly.
      const sessionId = context.request.cookies.get(SESSION_COOKIE);

      if (!sessionId) {
        return {
          authenticated: false,
          actorType: "USER",
          user: null,
          permissions: [],
        };
      }

      // Session persistence belongs to Authentication.
      const session = await getSession(context.db, sessionId);

      if (!session || session.expiresAt <= new Date()) {
        return {
          authenticated: false,
          actorType: "USER",
          user: null,
          permissions: [],
        };
      }

      // User is owned by another capability package.
      // Cross-package access therefore goes through the Internal API.
      const user = await context.internalApi.call(
        "@core/user",
        "get",
        { id: session.userId },
      );

      if (!user || user.status !== "ACTIVE") {
        return {
          authenticated: false,
          actorType: "USER",
          user: null,
          permissions: [],
        };
      }

      return {
        authenticated: true,
        actorType: "USER",
        user,
        permissions: await getPermissions(context.db, user.id),
      };
    },

    async login({ email, password }) {
      // User lookup is cross-package and therefore goes through Internal API.
      const user = await context.internalApi.call(
        "@core/user",
        "findByEmail",
        { email },
      );

      if (!user || user.status !== "ACTIVE") {
        throw new AuthenticationError("Invalid credentials");
      }

      // Credential storage / verification belongs to Authentication.
      const valid = await verifyPassword(context.db, user.id, password);

      if (!valid) {
        throw new AuthenticationError("Invalid credentials");
      }

      const session = await createSession(context.db, user.id);

      // Authentication owns the meaning of the cookie.
      // Platform only provides the generic cookie-writing primitive.
      context.request.cookies.set(
        SESSION_COOKIE,
        session.id,
        {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        },
      );

      return {
        authenticated: true,
        actorType: "USER",
        user,
        permissions: await getPermissions(context.db, user.id),
      };
    },

    async logout() {
      const sessionId = context.request.cookies.get(SESSION_COOKIE);

      if (sessionId) {
        await deleteSession(context.db, sessionId);
      }

      context.request.cookies.delete(SESSION_COOKIE);
    },

    async can({ permission, organizationId }) {
      const auth = await this.get();

      if (!auth.authenticated || !auth.user) {
        return { allowed: false };
      }

      return {
        allowed: await evaluatePermission(
          context,
          auth.user.id,
          permission,
          organizationId,
        ),
      };
    },

    async authorize(parameters) {
      const { allowed } = await this.can(parameters);

      if (!allowed) {
        throw new AuthorizationError("Not authorized");
      }
    },
  };
}
```

The important boundary is:

```text
Platform runtime primitive
    context.request.cookies.get(...)

Cross-capability interaction
    context.internalApi.call("@core/user", ...)
```

## Persistence

Authentication may own persistence even though its semantic contract has no `dataDefinition`.

A typical implementation would persist credentials and sessions.

### Authentication credentials

```sql
CREATE TABLE IF NOT EXISTS auth_credential (
    user_id BIGINT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    password_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_auth_credential_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
        ON DELETE CASCADE
);
```

`auth_credential.user_id` can use a real foreign key because `@voyzu/authentication` has a hard package dependency on `@voyzu/users`; the User storage is therefore guaranteed to exist when Authentication is installed.

The semantic contract does not expose password hashes or credential records.

### Authentication sessions

```sql
CREATE TABLE IF NOT EXISTS auth_session (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    CONSTRAINT fk_auth_session_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS auth_session_user_idx
    ON auth_session (user_id);

CREATE INDEX IF NOT EXISTS auth_session_expires_idx
    ON auth_session (expires_at);
```

The exact physical User table name is implementation-specific. If Users moves to a package-owned schema, these foreign keys should point to that package-owned table.

## Business logic

Authentication owns authentication and authorization behaviour, including:

- verifying credentials;
- creating, resolving, expiring and revoking sessions;
- deciding how authentication cookies are interpreted;
- deriving the current authenticated execution context;
- evaluating roles / grants / permissions owned by Authentication;
- enforcing authorization decisions through `authorize`.

Authentication does not own:

- the User master record;
- Organization records;
- user-to-Organization assignment if that relationship belongs to the Organization capability;
- UI placement or the login-page presentation.

Where authorization requires information owned by another capability, Authentication uses that capability's Internal API.

For example, Organization-scoped access may require:

```ts
const access = await context.internalApi.callOptional(
  "@core/organization-access",
  "hasAccess",
  {
    userId,
    organizationId,
  },
);
```

The optional call allows Authentication to operate in a Voyzu installation that does not have Organizations.

## Internal API registration

The package supplies its implementation to Platform.

Illustrative package registration:

```ts
contracts: {
  internalApi: {
    implements: {
      "@core/auth": (context: CapabilityContext) =>
        createAuthenticationMethods(context),
    },
  },
},
```

Platform:

1. discovers the package;
2. validates that the package implements a defined semantic contract;
3. registers the implementation;
4. creates the runtime context for the current execution;
5. invokes the Authentication implementation when another caller uses `@core/auth`.

A caller uses the ordinary Internal API:

```ts
const auth = await internalApi.call(
  "@core/auth",
  "get",
);
```

The caller does not know which package implements the contract.

## HTTP API

The HTTP API is a transport over the same Authentication behaviour.

Illustrative routes:

| Method | Path | Request / Response | Result |
| --- | --- | --- | --- |
| GET | `/auth` | ↓&nbsp;[AuthenticationContextResponseDto](#authenticationcontextresponsedto) | Current `AuthenticationContext`. |
| POST | `/auth/login` | ↑&nbsp;[AuthenticationLoginRequestDto](#authenticationloginrequestdto)<br>↓&nbsp;[AuthenticationContextResponseDto](#authenticationcontextresponsedto) | Verifies credentials, creates a session and returns the authenticated context. |
| POST | `/auth/logout` | No request or response body. | Revokes the current session and removes the session cookie. |
| POST | `/auth/can` | ↑&nbsp;[AuthenticationCanRequestDto](#authenticationcanrequestdto)<br>↓&nbsp;[AuthenticationCanResponseDto](#authenticationcanresponsedto) | Returns whether the current actor has the requested permission. |

The HTTP handlers call the same Authentication methods used by the Internal API; they do not duplicate authentication business logic.

## UI

The Authentication capability package does not need to own the primary Voyzu login or user-management experience.

The ERP UI package may own:

- login screen;
- logout action;
- session-expired screen;
- access-denied screen;
- user-management screens;
- role / permission administration.

The UI calls the Authentication capability through the Internal API or HTTP API.

```text
@voyzu/erp-ui
    Login / session UX
          ↓
      @core/auth
          ↓
@voyzu/authentication
```

A different UI package can provide a different authentication experience over the same capability.

## Components

Authentication does not require capability-owned components.

If reusable authentication UI components are later useful — for example a login form, current-user menu or access-denied panel — they may be exposed as optional UI contributions, but they are not part of the semantic contract.

## Types

Semantic types live with the shared semantic contract. Authentication implementation DTOs reuse those types directly where their shapes match.

### AuthenticationLoginRequestDto

```ts
import type { AuthenticationMethods } from "@voyzu/semantic-contracts/authentication";

export type AuthenticationLoginRequestDto =
  Parameters<AuthenticationMethods["login"]>[0];
```

### AuthenticationContextResponseDto

```ts
export type {
  AuthenticationContext as AuthenticationContextResponseDto,
} from "@voyzu/semantic-contracts/authentication";
```

### AuthenticationCanRequestDto

```ts
import type { AuthenticationMethods } from "@voyzu/semantic-contracts/authentication";

export type AuthenticationCanRequestDto =
  Parameters<AuthenticationMethods["can"]>[0];
```

### AuthenticationCanResponseDto

```ts
import type { AuthenticationMethods } from "@voyzu/semantic-contracts/authentication";

export type AuthenticationCanResponseDto =
  Awaited<ReturnType<AuthenticationMethods["can"]>>;
```

Transport-specific DTOs should only be introduced where HTTP or another transport genuinely requires a different shape.
