# Page routing contract

The below example `voyzu.package.ts` entry represents and explains the various page route configuration options

```typescript
// voyzu.package.ts
// Illustrative proposed shape:
// - contracts.pageRouting and its roots/routes properties are proposed.
// - The individual route properties below already exist in 0.2.

export default {
  contracts: {
    pageRouting: {
      // URL roots owned by this package. Every page route must fall within one.
      // Currently these are declared as pageRootPaths in package.json.
      roots: ["/finance"],

      // The platform works with a flat collection of routes.
      // These definitions can still be imported from separate module files.
      routes: [
        {
          // Stable, system-wide unique identity for this route.
          // Navigation references this ID rather than repeating the URL.
          id: "finance.journals.detail",

          // URL pattern. [code] captures one path segment.
          // /finance/journals/JNL-001 supplies code: "JNL-001" to the page.
          path: "/finance/journals/[code]",

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

          // The page receives:
          // - Path parameters as props, e.g. props.code.
          // - Current path, route metadata and query values in props.surface.
          //
          // Example: /finance/journals/JNL-001?tab=lines&showAudit=true
          // props.code                         => "JNL-001"
          // props.surface.searchParams.tab     => "lines"
          // props.surface.searchParams.showAudit => "true"
          //
          // Currently queries have no schema, conversion or defaults.
          // The page must interpret and validate these string values itself.
          // Repeated query parameters are currently dropped by the renderer.

          // Initial breadcrumbs supplied to the framed page.
          // The page can extend these with a record-specific breadcrumb.
          // A breadcrumb without href is a label rather than a link.
          breadcrumbBase: [
            { label: "Finance" },
            { label: "Journal Entries", href: "/finance/journals" },
          ],

          // Base URL for resolving relative help references.
          // Normally supplied from package-level help configuration;
          // shown here to illustrate the complete route metadata.
          helpBaseUrl: "https://docs.example.com/finance/",

          // Fixed help reference for this page.
          helpPath: "journal-details",

          // Alternative: choose the help reference from the current URL.
          // If supplied, the resolver's result replaces helpPath,
          // including when it returns undefined. These are alternatives,
          // although the current type allows both to be declared.
          //
          // helpPathResolver: ({ path, params, searchParams }) =>
          //   searchParams.tab === "lines"
          //     ? "journal-lines"
          //     : "journal-details",

          // Reference to related API documentation for this page.
          // This is documentation metadata; it does not register an API route.
          apiDocsUrl: "/api-reference/finance/journals",

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
            // redirected to login. The current authorization pipeline,
            // including the custom callback below, runs when this is true.
            required: true,

            // Require at least this platform role.
            // Current roles are STANDARD and ADMIN.
            // The platform also checks account status and UI access.
            minRole: "STANDARD",

            // Optional additional check, run AFTER the standard checks pass.
            // It supplements minRole; it is not an alternative to it.
            // Receives { user, route, path }; parsed path parameters and
            // query parameters are not currently supplied to this callback.
            //
            // Return "allow", "denied" or "unauthenticated".
            // The function below is an illustrative package implementation.
            authorize: async context => {
              const { authorizeJournalAccess } =
                await import("./modules/journals/authorization");

              return authorizeJournalAccess(context);
            },
          },

          // packageName is attached by composition from package ownership,
          // so the package does not need to repeat it on every route.
          //
          // A route does not need a navigation entry to be accessible.
          // Surface contributions separately reference this route's ID.
        },
      ],

      // Composition collects routes and checks their declarations,
      // package-owned URL roots, duplicate route IDs and duplicate paths.
    },
  },
};
```

## Authorization

Pretty well explained above

## Links

to patturns like breadcrumbs is one

## Proposed queries

```typescript
path: "/finance/journals/[code]",

input: {
  path: Type.Object({
    code: Type.String({
      description: "Journal entry code.",
    }),
  }),

  query: Type.Object({
    tab: Type.Optional(
      Type.Union([
        Type.Literal("details"),
        Type.Literal("lines"),
      ], {
        description: "Initially selected tab.",
        default: "details",
      }),
    ),

    showAudit: Type.Optional(
      Type.Boolean({
        description: "Whether to initially display audit information.",
        default: false,
      }),
    ),
  }),
},
```

id is key

```
contracts: {
  pageRouting: {
    roots: ["/finance"],

    routes: {
      "finance.journals.detail": {
  ```