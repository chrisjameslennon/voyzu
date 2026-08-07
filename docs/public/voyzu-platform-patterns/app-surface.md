# UI Application surface patterns

Voyzu renders package pages inside a shared application surface. Packages declare their routes and may contribute top and left navigation; the Voyzu composer turns those declarations into the runtime registry. This system is known in Voyzu as the "UI Surface"

## Define page routes in the module

Each UI-capable module defines its page routes in its top-level `module.ts`. The route is the source of truth for the URL, page component, title, authorization, breadcrumbs, and help link.

```tsx
// packages/@acme/warehousing/modules/stock/module.ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { StockDetailPage, StockListPage } from "./server/pages";

export const stockModule = {
  pageRoutes: {
    list: {
      id: "acme.stock.page.list",
      path: "/stock",
      pageTitle: "Stock",
      Page: StockListPage,
      breadcrumbBase: [{ label: "Warehousing", href: "/stock" }],
      helpPath: "packages/warehousing/stock",
      auth: { required: true, minRole: "COMPANY_USER" },
    },
    detail: {
      id: "acme.stock.page.detail",
      path: "/stock/[code]",
      pageTitle: "Stock item",
      Page: StockDetailPage,
      breadcrumbBase: [{ label: "Warehousing", href: "/stock" }],
      helpPath: "packages/warehousing/stock",
      auth: { required: true, minRole: "COMPANY_USER" },
    },
  },
  apiDefinitions: {},
} as const satisfies VoyzuPackageModuleDefinition;
```

Voyzu supports static and dynamic path segments. A page component receives the parameters supplied by the Next.js catch-all route. Keep page components in a server-only page entry point when they access the database or other private server functionality.

The supported route authorization roles are `COMPANY_USER`, `ORGANIZATION_USER`, and `ADMIN`. A public route must set `auth.required` to `false` deliberately; authenticated package pages should normally set it to `true`.

## Export the modules from the package

The package definition must contain every module that should be composed.

```ts
// packages/@acme/warehousing/voyzu.package.ts
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { stockModule } from "./modules/stock/module";

const packageDefinition = {
  modules: [stockModule],
} as const satisfies VoyzuPackageDefinition;

export default packageDefinition;
```

The package's `package.json` must expose `./voyzu-package`. Composition imports that export and registers the page and API definitions from its `modules` array.

## Add top navigation

Navigation is optional. A package with a normal user interface may export one top-navigation item. Its `routeId` must identify one of the package's page routes; that route becomes the domain's default path.

```ts
// packages/@acme/warehousing/navigation/top-nav.ts
export default {
  label: "Warehousing",
  routeId: "acme.stock.page.list",
} as const;
```

Expose it from `package.json`:

```json
{
  "exports": {
    "./voyzu-package": "./voyzu.package.ts",
    "./navigation/top-nav": "./navigation/top-nav.ts"
  }
}
```

Packages that provide only APIs, scripts, or server services may omit navigation entirely.

## Add left navigation

Left navigation is an array of groups. A group may have a heading, and its items identify a composed route by `routeId` and may contain nested items.

```ts
// packages/@acme/warehousing/navigation/left-nav.ts
export default [
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
] as const;
```

Expose it as `./navigation/left-nav` in `package.json`. A package may omit its left navigation even when it has top navigation. When both are present, the left navigation is shown while a route belonging to that top-level package domain is active.

Route IDs avoid repeating URLs in navigation. The composer validates the top navigation's route ID. Left-navigation links must likewise use IDs declared by the package.

## Compose after installation

The install and link-package workflows compose packages automatically. Composition:

1. discovers active packages below `.run/packages/@publisher/package-name`;
2. imports each package's `voyzu.package.ts` through its public export;
3. collects page routes and API definitions;
4. includes optional top and left navigation exports;
5. writes generated runtime registries; and
6. updates the runtime workspace and Next.js transpilation metadata.

Generated files are runtime output and must not be edited. Restart the web server after installing, linking, or recomposing packages.

## Use the main area

By default, the application frame owns the top navigation and optional left navigation, and the active page renders in the remaining main area.

Set `unframed: true` only when a route must bypass the complete application frame. This removes the top navigation, left navigation, normal main wrapper, and breadcrumb provider; the page component is responsible for the entire response layout.

```tsx
// packages/@acme/analytics/modules/dashboard/module.ts
pageRoutes: {
  dashboard: {
    id: "acme.dashboard.page.main",
    path: "/dashboard",
    pageTitle: "Dashboard",
    Page: DashboardPage,
    unframed: true,
    auth: { required: true, minRole: "COMPANY_USER" },
  },
}
```

Use this sparingly for routes such as authentication screens and printable documents. The current package contract does not let a package replace the platform's top navigation or register a right-hand application slot.

## Back navigation

Use `VoyzuBackButton` for a predictable destination:

```tsx
// packages/@acme/warehousing/modules/stock/server/pages/StockDetailPage.tsx
import { VoyzuBackButton } from "@voyzu/ui-components";

<VoyzuBackButton href="/stock" label="Stock" />;
```

Use `VoyzuContextBackButton` when a list page carries meaningful query-string state such as filters, sorting, or paging. The context-aware button may restore the saved list URL; `href` remains the fallback.

```tsx
import { VoyzuContextBackButton } from "@voyzu/ui-components";

<VoyzuContextBackButton
  href="/stock"
  label="Stock"
  contextKey="stock"
  fallbackHref="/stock"
/>;
```

Keep context keys stable and module-specific. Back navigation is not a breadcrumb and should not be used as a second navigation hierarchy.

## Help links

Set `helpPath` on the page route. Voyzu resolves it against the owning package's `voyzu.settings.helpBaseUrl` value from `package.json`. The surface displays the help icon only when the active route has both settings.

Use a stable documentation path rather than deriving a help URL from the application URL.

See [Documentation and help](documentation-and-help.md) for the complete package documentation pattern.
