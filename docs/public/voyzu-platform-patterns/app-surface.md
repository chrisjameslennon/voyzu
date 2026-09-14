# UI application surface patterns

Voyzu renders package pages inside a shared application surface. A package declares its routes and may contribute one or more navigation areas with their own navigation. The Voyzu composer turns those package declarations into the runtime application.

The application surface supplies the desktop and mobile application frame, navigation, current-user actions, help action, breadcrumbs and main content area. Package developers supply the pages and describe how users reach them.

## Declare page routes in the package

A UI-capable package registers its page routes in `contracts.pageRouting` in
`voyzu.package.ts`. A route is the source of truth for its
URL, lazy page loader, title, authorization, breadcrumbs, and help link.
Modules remain a way to organize code inside the package; the package is the
unit that Voyzu composes and manages.

```ts
// packages/@acme/warehousing/modules/stock/pages.routes.ts
export const pageRoutes = {
  "acme.stock.page.list": {
    path: "/warehousing/stock",
    pageTitle: "Stock",
    loadPage: () => import("./server/pages/StockListPage")
      .then((module) => module.StockListPage),
    breadcrumbBase: [{ label: "Warehousing", href: "/warehousing/stock" }],
    helpPath: "packages/warehousing/stock",
    auth: { required: true, minRole: "STANDARD" },
  },
  "acme.stock.page.detail": {
    path: "/warehousing/stock/[code]",
    pathParams: { code: { type: "string" } },
    pageTitle: "Stock item",
    loadPage: () => import("./server/pages/StockDetailPage")
      .then((module) => module.StockDetailPage),
    breadcrumbBase: [{ label: "Warehousing", href: "/warehousing/stock" }],
    helpPath: "packages/warehousing/stock",
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

Voyzu supports static and dynamic path segments. Composition adds package page
definitions to the surface registry, and the platform wildcard page matches the
requested path and supplies its parameters. The surface router retains
authorization, package visibility, framing, breadcrumbs, and help behavior.
The route manifest imports no page or server barrel eagerly; `loadPage` loads
the selected server page only when the route is rendered.

The supported route authorization roles are `STANDARD` and `ADMIN`. A public route must set `auth.required` to `false` deliberately; authenticated package pages should normally set it to `true`.

## Register the page routing contract

Import module route maps into the package contract. Use a checked merge when combining multiple maps:

```ts
// voyzu.package.ts
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as stockRoutes } from "./modules/stock/pages.routes";

export default {
  modules: [],
  contracts: {
    pageRouting: {
      roots: ["/warehousing"],
      routes: mergePageRoutes(stockRoutes),
    },
  },
};
```

The package exports `./voyzu-package`. Module route exports alone do not register pages. Each page receives one `context` prop containing `path`, `pathParams`, `queryParams` and `routeDefinition`. See the [page routing contract](../platform-contracts/page-routing-contract.md) for parsing, validation and route resolution.

## Declare navigation contributions

Packages declare `contracts.uiSurface` in `voyzu.package.ts`. The three contribution slots are `topnav.menu`, `leftnav.menu` and `leftnav.header`. Top-menu destinations select page-routing roots; left-menu and header contributions target roots explicitly. Each package controls its own navigation, with `/settings` as the shared menu exception. See the [UI surface contract](../platform-contracts/ui-surface-contract.md).

```ts
// voyzu.package.ts — other contracts omitted.
import leftNav from "./ui-surface/left-nav";

export default {
  contracts: {
    uiSurface: {
      "topnav.menu": {
        "operations": { label: "operations", routeId: "acme.operations.page.list" },
      },
      "leftnav.menu": {
        "/operations": { content: leftNav },
      },
    },
  },
};
```

```ts
// ui-surface/left-nav.ts
export default [{
  items: {
    "operations.list": { label: "List", routeId: "acme.operations.page.list" },
  },
}] as const;
```

## Desktop navigation

On desktop, Voyzu displays one top-navigation item for every visible navigation area. Selecting an item opens that navigation area's default route. Voyzu compares the current route with each root's declared routes to highlight the active navigation area and display its left navigation.

Package Management controls package-level navigation order. If one package supplies several navigation areas, those navigation areas remain together in their declared order at the package's position.

The package supplies navigation declarations only. It must not import or reproduce Voyzu's top navigation, mobile drawer or application frame.

## Mobile navigation

On mobile, the application bar omits the Voyzu logo. It displays a hamburger action followed by the current navigation area name. The same behavior is supplied to platform packages and independently installed third-party packages.

Opening the drawer shows:

1. the visible navigation areas, in the same package-controlled order as the desktop top navigation; and
2. the active navigation area's left-navigation groups and items below the navigation area list.

Selecting a navigation area opens its default route. Selecting a left-navigation item navigates within the active navigation area. A package with no left navigation still receives the global hamburger menu and navigation area list.

Packages do not implement a separate mobile menu. The composer and shared application surface derive desktop and mobile navigation from the same slot contributions.

## Package UI visibility

Package Management provides two independent controls:

* **Show top navigation** controls the package's navigation items in the desktop top navigation and mobile drawer.
* **Show page routes** controls whether package pages can be opened, including through direct URLs.

These controls do not affect HTTP API routes, uninstall the package, run uninstall scripts or delete data. Package code does not need special visibility checks; Voyzu applies both controls at the shared application surface.

## Compose after installation

The install and link-package workflows compose packages automatically. Composition reads `pageRouting`, `httpApiRouting`, `httpApiDocumentation` and `uiSurface` from package definitions. It validates roots and references, then writes page, API, navigation, header and documentation registries beneath `apps/web/.generated`. Full composition also updates workspace configuration; `--routing-only` refreshes routing, surface contributions and documentation.

Pre-installed packages and independently installed packages pass through the
same descriptor and surface validation and produce registries with the same
shape. They are kept in paired `pre-installed.ts` and `installed.ts` files only
so platform startup can refresh one group without erasing the other.

`.generated` files are runtime output and must not be edited. Restart the web
server after installing, linking, or recomposing
packages.

## Use the main area

By default, the application frame owns the top navigation and optional left navigation, and the active page renders in the remaining main area.

Set `unframed: true` only when a route must bypass the complete application frame. This removes the top navigation, left navigation, normal main wrapper, and breadcrumb provider; the page component is responsible for the entire response layout.

```ts
// packages/@acme/analytics/modules/dashboard/pages.routes.ts
export const pageRoutes = {
  "acme.dashboard.page.main": {
    path: "/analytics/dashboard",
    pageTitle: "Dashboard",
    loadPage: () => import("./server/pages/DashboardPage")
      .then((module) => module.DashboardPage),
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
