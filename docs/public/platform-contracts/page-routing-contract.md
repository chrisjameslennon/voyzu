# Page routing contract

The following `voyzu.package.ts` example defines the page routing contract:

```typescript
// voyzu.package.ts

export default {
  contracts: {
    pageRouting: {
      // URL roots owned by this package. Every page route must fall within one.
      roots: ["/finance"],

      // Routes are keyed by their stable, system-wide unique IDs.
      // Navigation references these keys rather than repeating URLs.
      // Definitions can be imported from separate module files.
      routes: {
        "finance.journals.detail": {
          // URL pattern. [code] captures one path segment.
          // /finance/journals/JNL-001 supplies context.pathParams.code: "JNL-001".
          path: "/finance/journals/[code]",

          // Declare each URL parameter with an inline primitive schema
          // or an imported DTO schema. A separate DTO is not required.
          // Every path placeholder must have a matching required declaration.
          pathParams: {
            code: {
              type: "string",
              minLength: 1,
              description: "Journal entry code.",
            },
          },

          // Missing or extra query parameters do not cause validation errors.
          // Extra parameters are stripped from context.queryParams.
          // Defaults apply only when a parameter is absent, not invalid.
          queryParams: {
            tab: {
              type: "string",
              enum: ["details", "lines"],
              default: "details",
              description: "Initially selected tab.",
            },
            showAudit: {
              type: "boolean",
              default: false,
              description: "Whether to initially display audit information.",
            },
          },

          // DTO alternative for an individual parameter (import not shown):
          // code: { schema: JournalCodeDto }
          // The platform parses values, applies defaults and validates them.
          // Invalid supplied values throw in development and log in production.
          // See "Page Query parsing" below for the detailed rules.

          // Browser/document title. Does not automatically render an H1.
          // The page controls its own visible heading.
          // Also used when describing the page in access-denied messages.
          pageTitle: "Journal Entry",

          // Loads the page component only when the route is opened,
          // after the platform has checked visibility and authorization.
          // Keeping this import lazy avoids loading page implementation code
          // when the platform merely reads the route definitions.
          loadPage: () =>
            import("./modules/journals/pages/JournalDetailPage")
              .then(module => module.default),

          // Initial breadcrumbs supplied to the framed page.
          // The page can extend these with a record-specific breadcrumb.
          // A breadcrumb without href is a label rather than a link.
          breadcrumbBase: [
            { label: "Finance" },
            { label: "Journal Entries", href: "/finance/journals" },
          ],

          // User help path, resolved against the package's helpBaseUrl.
          // See "Help resolution" below for dynamic help paths.
          helpPath: "journal-details",

          // API documentation: controls "Show HTTP API for this page"
          // in the implementer menu, independently of the Help icon.
          // The menu requires implementer access, and the action requires
          // the HTTP API reference package to be visible.
          // Composition validates the group ID and resolves its generated URL.
          // Omit this to open the landing page at /http-api-reference.
          // This reference does not register an HTTP API route.
          httpApiDocumentationGroupId: "finance.journals",

          // false: render inside the normal platform surface.
          // true: render the page without the platform frame or breadcrumbs,
          //       useful for printing or a page with its own layout.
          // Shared root CSS, fonts and providers still apply either way.
          // Authorization still runs when unframed is true.
          unframed: false,

          // Authentication, role checks and custom authorization can coexist.
          // The platform performs them before loading the page component.
          auth: {
            // Require a signed-in user. An unauthenticated visitor is
            // redirected to login. The authorization pipeline,
            // including the custom callback below, runs when this is true.
            required: true,

            // Require at least this platform role.
            // Roles are STANDARD and ADMIN.
            // The platform also checks account status and UI access.
            minRole: "STANDARD",

            // Optional additional check, run AFTER the standard checks pass.
            // It supplements minRole; it is not an alternative to it.
            // Receives { user, route, path }; parsed path parameters and
            // query parameters are not supplied to this callback.
            //
            // Return "allow", "denied" or "unauthenticated".
            // The function below is an illustrative package implementation.
            authorize: async context => {
              const { authorizeJournalAccess } =
                await import("./modules/journals/authorization");

              return authorizeJournalAccess(context);
            },
          },

        },
      },

    },
  },
};
```

## What the page receives

The page receives one prop, `context`:

```typescript
function JournalDetailPage({ context }) {
  const { path, pathParams, queryParams, routeDefinition } = context;
  // Render the page using these values.
}
```

- `path`: the actual URL path, with parameter values substituted.
- `pathParams`: parsed path values.
- `queryParams`: parsed, declared query values and applicable defaults.
- `routeDefinition`: the entire package route definition, enriched with `id` from its key, `packageName`, `helpBaseUrl` and `httpApiDocsUrl`. Its `helpPath` contains the resolver's result when a resolver is supplied. All other fields, including `loadPage` and `auth`, remain available.

Both parameter objects always exist, even when empty. Route metadata is not duplicated directly on `context`. Use `PageProps` and `PageContext` from `@voyzu/types/page-routing`; both accept path and query declaration types as generic arguments and include the production raw-value fallback. Keep the full context on the server: `routeDefinition` contains functions. Pass only the serializable values needed by client components.

For `/finance/journals/JNL-001?tab=lines&showAudit=true`:

```typescript
context.path                         // "/finance/journals/JNL-001"
context.pathParams.code              // "JNL-001"
context.queryParams.tab              // "lines"
context.queryParams.showAudit        // true
context.routeDefinition.id           // "finance.journals.detail"
context.routeDefinition.path         // "/finance/journals/[code]"
context.routeDefinition.helpBaseUrl  // "https://docs.example.com/finance/"
```

Without the query string, `queryParams.tab` defaults to `"details"` and `queryParams.showAudit` defaults to `false`.

## Page Query parsing

The platform parses path and query values, applies defaults and validates them before loading the page. Pages receive the results in `context.pathParams` and `context.queryParams`; the help resolver receives the same parameter objects.

Use either inline `type` and constraints or an imported DTO through `schema`, not both. `default` and `description` are parameter metadata. The inline schema or DTO defines the value's type and constraints, and both forms follow the same conversion rules. DTOs must declare a single primitive type (`string`, `number`, `integer` or `boolean`), or an array of primitives for queries. Scalar enums and constants are supported alongside an explicit type. Nested objects, unions, references and unsupported constraints are rejected during composition.

- Strings remain strings. Booleans accept only `"true"` or `"false"`.
- Numbers and integers parse URL strings as finite signed decimal values, such as `"2"`, `"-2"`, `"+2"` and `"12.50"`. Reject empty values, whitespace, exponent notation (`"1e3"`), non-decimal notation and partial numbers (`"12abc"`). Integer parameters also reject fractional values. Numeric DTOs use the same rules as inline `type: "number"` or `type: "integer"`. A literal plus sign in a query must be URL-encoded as `%2B`.
- Path parameters must be required scalars and match the path placeholders exactly.
- Missing query parameters are allowed: apply a declared default, otherwise leave the parameter absent. Defaults do not replace invalid supplied values. Query declarations do not require parameter presence.
- Repeated scalar query parameters are invalid. Array query parameters collect repeated values and parse each using their `items` schema.
- Extra, undeclared query parameters are stripped from `context.queryParams` and the help resolver's `queryParams`. They remain in the browser URL. Missing and extra query parameters neither throw nor log validation errors.

Invalid supplied parameter values throw an error in development. In production, they log an error and allow rendering to continue; validation does not render a separate input-error page. For queries, this applies only to supplied, declared parameters, not missing or extra parameters. Include the route ID, parameter name and failure reason in the error. Production logging does not guarantee that supplied values satisfy the declared types, and invalid values must not silently receive defaults. Visibility and authorization checks still apply.

If any declared query value fails parsing or validation in production, pass the entire raw query object as `context.queryParams`, with undeclared keys still stripped. Apply no conversions or defaults to that fallback object, including parameters that were valid. Preserve supplied strings and arrays of strings for repeated keys; missing keys remain absent. The help resolver receives the same fallback object. Invalid path parameters follow the same production policy: log the error and supply the raw path-parameter object without conversions. Path and query validation fall back independently.

For example, with the route above, `?tab=unknown&showAudit=true&extra=1` logs an error and supplies `{ tab: "unknown", showAudit: "true" }` in production. `showAudit` remains a string and `extra` is stripped.

## Help resolution

The package declares the base URL for its published user help in `package.json`:

```json
{
  "voyzu": {
    "settings": {
      "helpBaseUrl": "https://docs.example.com/finance/"
    }
  }
}
```

The platform's Help icon opens user documentation in a new tab. It resolves the route's `helpPath` against `voyzu.settings.helpBaseUrl` from `package.json`. Composition supplies the base URL; it is not a route setting. With the example configuration, `journal-details` resolves to `https://docs.example.com/finance/journal-details`.

The icon is hidden if either the base URL or help path is absent. Omitting `helpPath` does not link to the documentation homepage.

To select help from the URL, use `helpPathResolver` instead of a fixed `helpPath`:

```typescript
helpPathResolver: ({ path, pathParams, queryParams }) =>
  queryParams.tab === "lines"
    ? "journal-lines"
    : "journal-details",
```

The resolver receives the same parsed parameter objects as the page. Its result becomes `context.routeDefinition.helpPath`; returning `undefined` hides the Help icon.

## Route resolution

Route matching does not depend on declaration order. Literal path segments take precedence over parameter placeholders at the same position.

For example, these routes can coexist:

```typescript
"/journals/new"
"/journals/[code]"
```

`/journals/new` opens the creation page; `/journals/JNL-001` opens the detail page. The value `new` therefore cannot address a journal through the detail route. Selecting the static route does not bypass its visibility or authorization checks or fall back to the dynamic route when access is denied.

Composition rejects equivalent dynamic patterns, even when their parameter names differ:

```typescript
"/journals/[code]"
"/journals/[id]"
```

Both patterns match the same URLs, so they conflict. The generated Next.js routes and the shared router follow the same resolution rules.

## Route ownership and navigation

Composition knows which package supplied each route and adds `packageName` automatically, for example `"@voyzu/finance"`. Route authors do not need to specify it.

Defining a route makes its URL available, subject to visibility and authorization checks. It does not need to appear in a menu. A journal detail page, for example, can be opened from a journal list.

Define navigation menu items separately, referencing the route's key. The platform resolves that reference to its URL.

## Composition

Running `npm run voyzu:compose` collects the page routes declared by each package and generates the application's route registry.

Before generating the registry, composition checks that:

- Each route definition follows this contract.
- Each route's URL sits within one of its package's declared `roots`. For example, a package declaring `/finance` can define `/finance/journals`, but not `/inventory/items`.
- Each route ID is unique across all packages.
- No two routes declare the same URL path or equivalent dynamic patterns, as described in "Route resolution".

If a check fails, composition reports an error so the conflicting or invalid declaration can be corrected.

Combine module route maps with `mergePageRoutes` from `@voyzu/types/page-routing`. It rejects duplicate keys before they can be overwritten. Module exports alone do not register routes; only `contracts.pageRouting` contributes pages.

Use `npm run voyzu:compose -- --surfaces-only` to refresh page/navigation registries and HTTP documentation without refreshing unrelated composition.
