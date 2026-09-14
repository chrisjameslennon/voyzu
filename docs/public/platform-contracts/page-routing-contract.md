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

Both parameter objects always exist, even when empty. Route metadata is not duplicated directly on `context`.

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

Use either inline `type` and constraints or an imported DTO through `schema`, not both. `default` and `description` are parameter metadata. The inline schema or DTO defines the value's type and constraints, and both forms follow the same conversion rules.

- Strings remain strings. Booleans accept only `"true"` or `"false"`.
- Numbers and integers parse URL strings as finite signed decimal values, such as `"2"`, `"-2"`, `"+2"` and `"12.50"`. Reject empty values, whitespace, exponent notation (`"1e3"`), non-decimal notation and partial numbers (`"12abc"`). Integer parameters also reject fractional values. Numeric DTOs use the same rules as inline `type: "number"` or `type: "integer"`. A literal plus sign in a query must be URL-encoded as `%2B`.
- Path parameters must be required scalars and match the path placeholders exactly.
- Missing query parameters are allowed: apply a declared default, otherwise leave the parameter absent. Defaults do not replace invalid supplied values. Query declarations do not require parameter presence.
- Repeated scalar query parameters are invalid. Array query parameters collect repeated values and parse each using their `items` schema.
- Extra, undeclared query parameters are stripped from `context.queryParams` and the help resolver's `queryParams`. They remain in the browser URL. Missing and extra query parameters neither throw nor log validation errors.

Invalid supplied parameter values throw an error in development. In production, they log an error and allow rendering to continue; validation does not render a separate input-error page. For queries, this applies only to supplied, declared parameters, not missing or extra parameters. Include the route ID, parameter name and failure reason in the error. Production logging does not guarantee that supplied values satisfy the declared types, and invalid values must not silently receive defaults. Visibility and authorization checks still apply.

If any declared query value fails parsing or validation in production, pass the entire raw query object as `context.queryParams`, with undeclared keys still stripped. Apply no conversions or defaults to that fallback object, including parameters that were valid. Preserve supplied strings and arrays of strings for repeated keys; missing keys remain absent. The help resolver receives the same fallback object.

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

## temp: changes needed

### Route id is the key, no longer inline

- Add `contracts.pageRouting` with `roots` and a `routes` object keyed by route ID, following the HTTP API routing contract.
- Migrate page route declarations from local keys such as `list` and `detail` with inline `id` properties to route-ID keys without an inline `id`. Preserve existing IDs so navigation references remain valid.
- Update composition to read the contract instead of discovering page route modules through package exports, and move page roots from `package.json` into the contract.
- Derive each runtime route's identity from its object key. Update route types and consumers that read inline declaration IDs, including navigation, page generation and HTTP API documentation validation.
- Preserve validation of package-owned roots, duplicate IDs across packages, duplicate paths and references to routes. Provide a checked module-route merge for detecting duplicate keys before flattening: composition cannot recover entries already overwritten by object spreading.
- Migrate platform and installed-package declarations, templates and documentation to the new shape.
- Update installation/refresh validation in `lib/runtime-tools/commands/voyzu.mjs`, manifest types in `lib/types/src/framework.ts`, and package-management inventory and home-route resolution to read page roots from the contract. Keep any exposed inventory `pageRootPaths` field populated from that source rather than package.json.
- Update module aggregators and navigation imports that use local keys such as `pageRoutes.list.id`; preserve domain membership, default routes and left-navigation references using the stable route keys.
- Update full and `--surfaces-only` composition, pre-installed and installed registries, and generated Next.js pages together. Packages without a page routing contract contribute no page routes. Keep `loadPage` lazy during contract discovery and validation.

### Pages receive differently named and shaped props

- Standardize page invocation as `<PageComponent context={context} />`, with `{ path, pathParams, queryParams, routeDefinition }`. Replace top-level path props and the `surface` prop with this single context object.
- Pass the entire composed route definition as `context.routeDefinition`, preserving its fields and functions. Derive `id` from the declaration key, attach package ownership and help/API documentation metadata, and resolve `helpPath` for the request without mutating the shared package definition.
- Remove duplicated context metadata: read help settings, API documentation URLs and `unframed` from `context.routeDefinition`. Keep the actual URL path in `context.path` and the route pattern in `context.routeDefinition.path`.
- Update shared route/page context types to infer parameter values from inline schemas and DTOs, including optional parameters and defaults. Always supply both parameter objects. Migrate page components, wrappers, generated page entry points, templates and documentation to the new context prop and terminology.
- Update `helpPathResolver` to receive `{ path, pathParams, queryParams }` using the same parsed values as the page, and migrate existing resolvers.
- Keep the full context at the server page boundary: `routeDefinition` includes functions and cannot be passed wholesale to a client component. Migrate wrappers to pass only the serializable values their client components need.
- Use the same resolved route definition for page context and the platform frame so the Help icon and page metadata agree. Preserve browser titles, breadcrumbs, unframed rendering, package visibility and authorization order; the authorization callback remains `{ user, route, path }` as specified above.

### Parse and validate path and query parameters

- Add route-level `pathParams` and `queryParams` declarations. Support inline primitive schemas (`type: "string"`, `"boolean"`, `"number"`, `"integer"`) and imported DTO schemas via `schema`, plus query arrays with an `items` schema. Normalize both forms into a shared schema-validation pipeline.
- Validate declarations during composition: path names must match placeholders exactly and be required scalars; reject conflicting inline/DTO definitions, unsupported schemas, invalid defaults and incompatible constraints. Query parameters may be absent; a valid default supplies an absent value. Do not enforce query presence through a required flag or DTO validation.
- Replace the renderer's string-only normalization with parsing, default application and validation. Implement the conversion and repeated-parameter rules in "Page Query parsing"; strip undeclared query parameters from the object passed to the page and help resolver. Reject unsupported or ambiguous DTO conversion shapes during composition rather than guessing at runtime.
- Keep visibility and authorization checks ahead of page loading. Invalid supplied values must throw in development and log an error in production while allowing rendering to continue. Missing or extra query parameters must neither throw nor log validation errors. Include the route ID, parameter name and failure reason; remove the proposed input-error page behaviour.
- Migrate platform and installed-package route declarations, including every query value that pages consume. Update templates and documentation, and cover conversion failures, defaults, missing and extra query parameters, repeated parameters, DTO/inline equivalence and environment-specific validation behaviour in the refactor's validation.
- Audit client-side `useSearchParams()` readers as well as server page props. Declare the parameters that belong to the page contract and update comparisons such as `showAudit === "true"` to consume parsed booleans where context is used. Browser URL readers still see the original URL; stripping applies to the context object.
- Build `context.path` from the URL's original path values before typed conversion, so a numeric parameter does not rewrite the actual path (for example, `001` to `1`). Preserve repeated query values until validation and avoid decoding URL values twice.
- On any query parsing or validation failure in production, pass the complete raw query object with undeclared keys stripped, without conversions or defaults. Preserve strings and repeated-value arrays and use the same fallback for the help resolver. Reflect this fallback in context types and cover mixed valid/invalid inputs.
- Implement signed decimal parsing consistently for inline schemas and numeric DTOs; reject whitespace, exponent notation, non-decimal notation, partial numbers and non-finite results.

### Route resolution

- Reject equivalent dynamic patterns during composition by comparing paths independently of placeholder names.
- Make static segments take precedence over parameter placeholders regardless of declaration order. Keep generated Next.js routes and the shared router consistent, including authorization and visibility behaviour after selecting a route.

### Remaining decisions before implementation

- Specify the production fallback for invalid path parameter values; the raw-object fallback above defines query behaviour only.
- Specify supported DTO schema shapes beyond the primitive and array declarations shown. Inline and DTO declarations must have identical parsing semantics.

### Refactor completion

- Refresh the affected runtime composition after syncing platform changes and migrating package declarations; use `npm run voyzu:compose -- --surfaces-only` for the page/navigation and HTTP documentation registries. Preserve runtime configuration and installed-package selection.
- Typecheck the affected platform and package projects after migration. Remove this temporary changes-needed section once the refactor is complete and the remaining decisions are reflected in the specification.
