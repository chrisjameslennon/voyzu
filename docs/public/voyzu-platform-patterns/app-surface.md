# UI application surface patterns

Voyzu renders package pages inside a shared application surface. A package declares its routes and may contribute one or more UI domains with their own navigation. The Voyzu composer turns those package declarations into the runtime application.

The application surface supplies the desktop and mobile application frame, navigation, current-user actions, help action, breadcrumbs and main content area. Package developers supply the pages and describe how users reach them.

## Declare page routes in the package

A UI-capable package exposes page routes through the modules listed in its `voyzu.package.ts`. A route is the source of truth for its URL, page component, title, authorization, breadcrumbs and help link. Modules remain a way to organize code inside the package; the installed package is the unit that Voyzu composes and manages.

```tsx
// packages/@acme/warehousing/modules/stock/pages.routes.ts
import { StockDetailPage, StockListPage } from "@acme/warehousing/modules/stock/server";

export const pageRoutes = {
  list: {
    id: "acme.stock.page.list",
    path: "/warehousing/stock",
    pageTitle: "Stock",
    Page: StockListPage,
    breadcrumbBase: [{ label: "Warehousing", href: "/warehousing/stock" }],
    helpPath: "packages/warehousing/stock",
    auth: { required: true, minRole: "STANDARD" },
  },
  detail: {
    id: "acme.stock.page.detail",
    path: "/warehousing/stock/[code]",
    pageTitle: "Stock item",
    Page: StockDetailPage,
    breadcrumbBase: [{ label: "Warehousing", href: "/warehousing/stock" }],
    helpPath: "packages/warehousing/stock",
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

Voyzu supports static and dynamic path segments. Composition adds package page definitions to the surface registry, and the platform wildcard page matches the requested path and supplies its parameters. The surface router retains authorization, package visibility, framing, breadcrumbs and help behavior. Keep page components in a server-only page entry point when they access the database or other private server functionality.

The supported route authorization roles are `STANDARD` and `ADMIN`. A public route must set `auth.required` to `false` deliberately; authenticated package pages should normally set it to `true`.

## Export the package definition

The package definition must contain every internal module whose routes or APIs should be composed.

```ts
// packages/@acme/warehousing/voyzu.package.ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { stockModule } from "./modules/stock/module";

const packageDefinition = {
  modules: [stockModule],
} as const satisfies VoyzuPackageDefinition;

export default packageDefinition;
```

The package's `package.json` must expose `./voyzu-package`. Composition imports that package definition and registers the page and API definitions collected from its `modules` array.

## Understand UI domains

A UI domain is an independently selectable area in Voyzu's application navigation. A package may provide:

* no UI domains when it supplies only APIs, scripts, database objects or server services;
* one UI domain for a focused user interface; or
* multiple UI domains when the package supplies distinct application areas.

Each domain declares:

* the label shown in application navigation;
* a default route opened when the user selects the domain;
* every page route that belongs to the domain; and
* the left-navigation groups used within that domain.

The route list must include detail, report and other domain pages even when they are not shown in the left navigation. Voyzu uses it to identify the active domain and render the correct navigation.

## Declare one or more UI domains

Export an array from `navigation/domains.ts`. The `routeId` is the default route and must also be present in `routeIds`.

```ts
// packages/@acme/operations/navigation/domains.ts
import type { VoyzuPackageNavigationDomain } from "@voyzu/types/framework";

const domains = [
  {
    label: "Warehousing",
    routeId: "acme.stock.page.list",
    routeIds: [
      "acme.stock.page.list",
      "acme.stock.page.detail",
    ],
    leftNav: [
      {
        label: "Inventory",
        items: [
          {
            label: "Stock",
            icon: "package",
            routeId: "acme.stock.page.list",
          },
        ],
      },
    ],
  },
  {
    label: "Purchasing",
    routeId: "acme.purchasing.page.orders",
    routeIds: [
      "acme.purchasing.page.orders",
      "acme.purchasing.page.orderDetail",
    ],
    leftNav: [
      {
        items: [
          {
            label: "Purchase orders",
            icon: "shopping_cart",
            routeId: "acme.purchasing.page.orders",
          },
        ],
      },
    ],
  },
] as const satisfies readonly VoyzuPackageNavigationDomain[];

export default domains;
```

Expose it from `package.json`:

```json
{
  "exports": {
    "./voyzu-package": "./voyzu.package.ts",
    "./navigation/domains": "./navigation/domains.ts"
  }
}
```

Domain labels should be short and distinct because they appear in both desktop and mobile navigation. Domains from the same package are composed in declaration order.

## Use the single-domain shorthand

A package with exactly one UI domain may instead expose `./navigation/top-nav` and, optionally, `./navigation/left-nav`. The top-navigation route becomes the default route, and all page routes in the package belong to that domain.

```ts
// packages/@acme/warehousing/navigation/top-nav.ts
export default {
  label: "Warehousing",
  routeId: "acme.stock.page.list",
} as const;
```

Left navigation is an array of groups. A group may have a heading, and an item identifies a composed route by `routeId`. Items may contain nested children. A domain may omit left navigation completely.

Route IDs avoid repeating URLs in navigation. The composer validates the domain and top-navigation route IDs. Left-navigation links must likewise use IDs declared by the package.

## Desktop navigation

On desktop, Voyzu displays one top-navigation item for every visible UI domain. Selecting an item opens that domain's default route. Voyzu compares the current route with each domain's declared routes to highlight the active domain and display its left navigation.

Package Management controls package-level navigation order. If one package supplies several domains, those domains remain together in their declared order at the package's position.

The package supplies navigation declarations only. It must not import or reproduce Voyzu's top navigation, mobile drawer or application frame.

## Mobile navigation

On mobile, the application bar omits the Voyzu logo. It displays a hamburger action followed by the current UI domain name. The same behavior is supplied to platform packages and independently installed third-party packages.

Opening the drawer shows:

1. the visible UI domains, in the same package-controlled order as the desktop top navigation; and
2. the active domain's left-navigation groups and items below the domain list.

Selecting a domain opens its default route. Selecting a left-navigation item navigates within the active domain. A package with no left navigation still receives the global hamburger menu and domain list.

Packages do not implement a separate mobile menu. The composer and shared application surface derive desktop and mobile navigation from the same domain declarations.

## Package UI visibility

Package Management provides two independent controls:

* **Show top navigation** controls the package's UI-domain items in the desktop top navigation and mobile drawer.
* **Show page routes** controls whether package pages can be opened, including through direct URLs.

These controls do not affect API routes, uninstall the package, run uninstall scripts or delete data. Package code does not need special visibility checks; Voyzu applies both controls at the shared application surface.

## Compose after installation

The install and link-package workflows compose packages automatically. Composition:

1. discovers the platform and installed packages in the runtime workspace;
2. imports each package's `voyzu.package.ts` through its public export;
3. collects page routes and API definitions;
4. includes optional domain navigation or single-domain navigation exports;
5. writes navigation, event, operation, and API Reference output beneath
   `apps/web/.generated` for the platform wildcard handlers to consume;
   and
6. updates the runtime workspace and Next.js transpilation metadata.

`.generated` files are runtime output and must not be edited. Restart the web
server after installing, linking, or recomposing
packages.

## Use the main area

By default, the application frame owns the top navigation and optional left navigation, and the active page renders in the remaining main area.

Set `unframed: true` only when a route must bypass the complete application frame. This removes the top navigation, left navigation, normal main wrapper, and breadcrumb provider; the page component is responsible for the entire response layout.

```tsx
// packages/@acme/analytics/modules/dashboard/pages.routes.ts
export const pageRoutes = {
  dashboard: {
    id: "acme.dashboard.page.main",
    path: "/analytics/dashboard",
    pageTitle: "Dashboard",
    Page: DashboardPage,
    unframed: true,
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

Use this sparingly for routes such as authentication screens and printable documents. The current package contract does not let a package replace the platform's top navigation or register a right-hand application slot.

## Back navigation

Use `DetailBackButton` for a predictable destination:

```tsx
// packages/@acme/warehousing/modules/stock/server/pages/StockDetailPage.tsx
import { DetailBackButton } from "@voyzu/ui-surface/client";

<DetailBackButton fallbackHref="/warehousing/stock" />;
```

When a list page carries meaningful query-string state such as filters, sorting, or paging, include that state in the detail-page URL and set `preserveSearchParams`. The button returns to the fallback route with the current detail-page query string preserved.

```tsx
import { DetailBackButton } from "@voyzu/ui-surface/client";

<DetailBackButton
  fallbackHref="/warehousing/stock"
  preserveSearchParams
/>;
```

For pages that may be opened from more than one known source, pass supported `from` and `fromCode` values or derive a package-owned `fallbackHref` from explicit return context. Back navigation is not a breadcrumb and should not be used as a second navigation hierarchy.

## Help links

Set `helpPath` on the page route. Voyzu resolves it against the owning package's `voyzu.settings.helpBaseUrl` value from `package.json`. The surface displays the help icon only when the active route has both settings.

Use a stable documentation path rather than deriving a help URL from the application URL.

See [Documentation and help](documentation-and-help.md) for the complete package documentation pattern.
