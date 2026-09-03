# Preinstalled Package Page and Navigation Composition

## Status

Proposed implementation specification for branch `0.2`.

## Scope

This change applies only to Voyzu's own preinstalled packages in the `voyzu` repository, i.e. packages under `packages/@voyzu/*` whose `package.json` declares:

```json
{
  "voyzu": {
    "preinstalled": true
  }
}
```

The first implementation covers only two runtime surfaces:

- page routes
- navigation

Explicitly out of scope for this change:

- packages from the separate `voyzu-packages` repository
- API routes
- commands
- slots and other extension surfaces
- React navigation components such as left-nav headers

The same pattern may later be extended to those surfaces, but this specification should not implement that work.

---

## Problem

Voyzu is package based, so the application must compose the page routes and navigation contributed by the packages that make up the application.

The problem is not the size of the route or navigation definition files themselves. They are small. The problem is what they import transitively.

Today a runtime import of a package definition can make the complete package/module graph reachable. A lightweight need such as finding a page path can therefore pull in page implementations, API handlers, commands, services, repositories, and their dependencies.

The runtime should be able to know that `/settings/users` exists without importing the implementation of the Users page, and without importing unrelated Auth API or command code.

The intended separation is:

```text
COMPOSITION / DISCOVERY
package.json + package manifests
        |
        v
voyzu compose
        |
        +--> generated page-route index
        +--> generated navigation index

RUNTIME
page request
        |
        v
small page-route manifests
        |
        | path match
        v
one lazy page import
```

The generated files are indexes only. They do not copy or reconstruct package route/navigation definitions.

---

## Core rules

1. `voyzu.package.ts` remains a package composition/install contract. It must not be required by the page or navigation runtime.
2. `module.ts` remains a module composition contract. It must not be required by the page or navigation runtime.
3. `pages.routes.ts` is the authoritative definition of a module's page routes.
4. Navigation source files are the authoritative definition of package navigation.
5. `voyzu compose` generates application-level indexes only.
6. Files imported by those generated indexes must be cheap and safe to import globally.
7. Executable page implementations must be imported lazily from `pages.routes.ts`.
8. Navigation must reference page route definitions directly rather than importing a package or module aggregator.
9. Do not replace TypeScript imports with string paths to page implementations. Lazy TypeScript imports retain compile-time checking of both the module path and exported component name.

---

# Page routes

## Current Auth example

`@voyzu/auth` currently has a small `users/module.ts` aggregator:

```ts
import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";

import { apiDefinitions } from "./api.routes";
import { pageRoutes } from "./pages.routes";
import { commands } from "./commands";

export const usersModule = {
  pageRoutes,
  apiDefinitions,
  commands,
} as const satisfies VoyzuPackageModuleDefinition;
```

This file is not itself large, but importing it reaches all four module surfaces.

The current `users/pages.routes.ts` also eagerly imports all three page implementations:

```ts
import { UserDetailPage } from "./server/pages/UserDetailPage";
import { UserProfilePage } from "./server/pages/UserProfilePage";
import { UsersListPage } from "./server/pages/UsersListPage";

export const pageRoutes = {
  list: {
    id: "voyzu.users.page.list",
    path: "/settings/users",
    Page: UsersListPage,
    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
  // ...
} as const;
```

Therefore importing `pages.routes.ts` currently imports the page implementations as well.

## Required page-route shape

Preinstalled package page routes should use a lazy, type-checked page loader.

The recommended property name is `loadPage`:

```ts
export const pageRoutes = {
  list: {
    id: "voyzu.users.page.list",
    path: "/settings/users",

    loadPage: () =>
      import("./server/pages/UsersListPage")
        .then((module) => module.UsersListPage),

    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },

  profile: {
    id: "voyzu.users.page.profile",
    path: "/settings/users/profile",

    loadPage: () =>
      import("./server/pages/UserProfilePage")
        .then((module) => module.UserProfilePage),

    pageTitle: "User Profile",
    helpPath: "help-platform/settings/user-profile",
    breadcrumbBase: [{ label: "Settings" }, { label: "Users" }],
    auth: { required: true, minRole: "STANDARD" },
  },

  detail: {
    id: "voyzu.users.page.detail",
    path: "/settings/users/[code]",

    loadPage: () =>
      import("./server/pages/UserDetailPage")
        .then((module) => module.UserDetailPage),

    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [
      { label: "Settings", href: "/settings/users" },
      { label: "Users", href: "/settings/users" },
    ],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
```

This preserves TypeScript checking. For example, both of these should fail at compile time:

```ts
import("./server/pages/UsersListPgae")
```

```ts
import("./server/pages/UsersListPage")
  .then((module) => module.UsersListPgae)
```

There is no string-based page registry.

## Surface route type and router

`VoyzuSurfaceRoute` currently contains a concrete `Page` function. Add lazy page loading to the route contract.

Because this first change is intentionally limited to preinstalled packages, keep `Page` temporarily for compatibility with packages that have not yet migrated:

```ts
export interface VoyzuSurfaceRoute {
  id: string;
  packageName?: string;
  path: string;
  pageTitle: string;

  // Legacy/runtime compatibility during migration.
  Page?: (props: Record<string, unknown>) => ReactNode | Promise<ReactNode>;

  // Preferred route implementation reference.
  loadPage?: () => Promise<
    (props: Record<string, unknown>) => ReactNode | Promise<ReactNode>
  >;

  // ...existing metadata
}
```

The surface router should resolve the implementation only after a route has matched and access checks have run:

```ts
const PageComponent = route.loadPage
  ? await route.loadPage()
  : route.Page;

if (!PageComponent) {
  throw new Error(`Page route ${route.id} has no page implementation.`);
}
```

The existing route/path matching behaviour does not need to be redesigned as part of this work.

The important sequence is:

```text
/settings/users
      |
      v
match lightweight route definition
      |
      v
auth / enabled checks
      |
      v
await route.loadPage()
      |
      v
UsersListPage and its dependency graph are loaded
```

---

# Page-route exports

The generated application index needs a public import path for each module's page-route manifest without importing the module aggregator.

Add explicit page-route exports to preinstalled package `package.json` files.

For Auth:

```json
{
  "exports": {
    "./users/pages.routes": "./modules/users/pages.routes.ts",
    "./auth/pages.routes": "./modules/auth/pages.routes.ts"
  }
}
```

Existing module exports such as:

```json
"./users": "./modules/users/module.ts"
```

can remain. They are simply not used by the page runtime index.

The convention for preinstalled modules is:

```text
./<module-name>/pages.routes
```

`voyzu compose` may discover page-route surfaces from `package.json` exports using this convention, in the same general manner that it already discovers exported event and command surfaces.

---

# Generated page-route index

`voyzu compose` should generate one page-route index containing the page-route manifests from all preinstalled packages in the Voyzu application.

Example Auth portion:

```ts
// Generated by voyzu compose. Do not edit.

import { pageRoutes as authAuthPageRoutes }
  from "@voyzu/auth/auth/pages.routes";

import { pageRoutes as authUsersPageRoutes }
  from "@voyzu/auth/users/pages.routes";

// Other preinstalled package page-route manifests are imported here.

export const preinstalledPageRoutes = [
  ...Object.values(authAuthPageRoutes),
  ...Object.values(authUsersPageRoutes),
  // ...other preinstalled package routes
];
```

This file does not import:

```ts
@voyzu/auth/voyzu-package
@voyzu/auth/users
```

and it does not contain copied route objects.

Its only purpose is to answer:

> Which page-route manifests exist in this Voyzu application?

Importing the generated page-route index loads all page-route metadata, because the router needs all paths in order to match a request. It must not load the page implementations behind those routes.

---

# Navigation

Navigation follows the same principle: runtime should import navigation definitions, not package/module aggregators.

## Current Auth example

Auth currently defines the Settings left navigation as:

```ts
import { usersModule } from "../modules/users/module";

export const settingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Users",
        icon: "person",
        routeId: usersModule.pageRoutes.list.id,
      },
    ],
  },
] as const;
```

This gives good type safety, but importing `usersModule` also reaches `api.routes.ts`, `commands.ts`, and `pages.routes.ts`.

Once `pages.routes.ts` is safe to import globally, navigation should reference it directly:

```ts
import { pageRoutes as usersPageRoutes }
  from "../modules/users/pages.routes";

export const settingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Users",
        icon: "person",
        routeId: usersPageRoutes.list.id,
      },
    ],
  },
] as const;
```

This preserves the type-checked relationship between navigation and the route ID without importing the complete users module.

Do not replace this with a duplicated string such as:

```ts
routeId: "voyzu.users.page.list"
```

unless the route is intentionally external to the package.

## Standard package navigation surface

For runtime composition, each preinstalled package should expose one package-level navigation manifest:

```text
./navigation
```

For example Auth can add:

```ts
// packages/@voyzu/auth/navigation/index.ts

import { settingsLeftNav } from "./settings.left-nav";

export const navigation = {
  leftNav: settingsLeftNav,
} as const;

export default navigation;
```

and expose it from `package.json`:

```json
{
  "exports": {
    "./navigation": "./navigation/index.ts"
  }
}
```

A package navigation manifest may contain the static navigation contributions that already exist for that package, for example:

```ts
export const navigation = {
  domains,
  topNav,
  leftNav,
} as const;
```

Properties that the package does not contribute can be omitted.

Existing more-specific exports such as `./navigation/settings`, `./navigation/domains`, `./navigation/top-nav`, and `./navigation/left-nav` may remain for compatibility. The generated runtime index should use the single `./navigation` surface.

Navigation manifests must be cheap to import. They may import page-route manifests for route IDs, because those page-route manifests use lazy page imports. They must not import `voyzu.package.ts` or `module.ts` merely to obtain route IDs.

---

# Generated navigation index

`voyzu compose` should generate one navigation index for all preinstalled packages that export `./navigation`.

Example:

```ts
// Generated by voyzu compose. Do not edit.

import authNavigation from "@voyzu/auth/navigation";
import welcomeNavigation from "@voyzu/welcome/navigation";
// ...other preinstalled package navigation manifests

export const preinstalledNavigation = [
  {
    packageName: "@voyzu/auth",
    navigation: authNavigation,
  },
  {
    packageName: "@voyzu/welcome",
    navigation: welcomeNavigation,
  },
  // ...
] as const;
```

The generator preserves the existing explicit platform navigation order. It must
not use filesystem discovery order as the user-visible navigation order.

Again, this is an index only. It does not copy the navigation definitions into generated code.

Platform runtime code can flatten/interpret these contributions into the existing top navigation, domains, and left navigation structures.

---

# Generated output

For this first implementation, the only new runtime composition files generated for these surfaces should be index files, for example:

```text
apps/web/.generated/
  page-routes/
    index.ts
  navigation/
    index.ts
```

The exact directory naming may follow existing `.generated` conventions, but the architectural requirement is:

> Voyzu Compose generates indexes, not duplicated surface definitions or implementations.

Do not generate page implementation wrappers or per-route Next.js files.

---

# Compose discovery

This first change concerns only preinstalled packages in the `voyzu` repository.

The current compose implementation treats preinstalled packages specially and skips them when composing the platform package root. That behaviour must be changed or a dedicated preinstalled-surface composition phase must be added so that page-route and navigation indexes can be generated from those packages.

For this scope, compose should:

1. discover packages under the Voyzu runtime `packages` directory;
2. select packages whose `package.json` has `voyzu.preinstalled === true`;
3. discover exported `./<module>/pages.routes` surfaces;
4. discover an optional exported `./navigation` surface;
5. generate the page-route index;
6. generate the navigation index;
7. perform validation at compose time where practical.

This does not require runtime imports of `voyzu.package.ts`.

`voyzu.package.ts` may still be used by composition/install tooling where appropriate. The rule is specifically that the generated page and navigation runtime indexes do not import it.

---

# Validation

Compose should fail clearly for invalid preinstalled page/navigation composition where it can determine the problem at compose time.

At minimum validate:

- duplicate page route IDs;
- duplicate exact page paths;
- a page route is within the package's declared `voyzu.pageRootPaths`;
- navigation route IDs resolve to a composed page route;
- a package navigation surface has the expected navigation shape.

Do not make route-matching algorithm changes part of this specification unless required to preserve existing behaviour.

---

# Runtime integration

The web surface should consume the generated indexes directly.

Conceptually:

```ts
import { preinstalledPageRoutes }
  from "../../.generated/page-routes";

import { preinstalledNavigation }
  from "../../.generated/navigation";
```

The existing hardcoded runtime imports of complete preinstalled package definitions should no longer be required to construct page routes or navigation.

The page-route index is consumed as the bare flattened route array shown above.
It does not inject package metadata into route objects. Automatic `apiDocsUrl`
generation is paused until API composition is redesigned.

The page runtime becomes:

```text
catch-all Voyzu route
      |
      v
preinstalledPageRoutes
      |
      v
match route.path
      |
      v
route auth/enabled checks
      |
      v
await route.loadPage()
      |
      v
page implementation
```

The navigation runtime becomes:

```text
preinstalledNavigation
      |
      v
static domain/top/left navigation composition
      |
      v
route IDs resolved against preinstalledPageRoutes
```

---

# Dependency boundary after this change

For the Auth Users page, the intended dependency graph is:

```text
GENERATED PAGE INDEX
      |
      v
@voyzu/auth/users/pages.routes
      |
      | contains metadata + lazy imports only
      |
      +-----------------------------+
                                    |
request /settings/users             |
      |                             |
      v                             |
match list route                    |
      |                             |
      v                             |
loadPage() -------------------------+
      |
      v
UsersListPage.tsx
      |
      +--> UserList client code
      +--> current-user service
      +--> user service
      +--> dependencies actually required by this page
```

The following must not be imported merely to match `/settings/users`:

```text
@voyzu/auth/voyzu.package.ts
@voyzu/auth/modules/users/module.ts
@voyzu/auth/modules/users/api.routes.ts
@voyzu/auth/modules/users/commands.ts
UsersListPage.tsx
UserDetailPage.tsx
UserProfilePage.tsx
```

The page implementation is loaded only after its route is selected.

---

# Implementation order

1. Extend `VoyzuSurfaceRoute` and the surface router to support `loadPage`, retaining `Page` temporarily for compatibility.
2. Migrate `pages.routes.ts` in Voyzu preinstalled packages to lazy page imports.
3. Add `./<module>/pages.routes` package exports for preinstalled modules with pages.
4. Change preinstalled navigation definitions to import page-route manifests directly instead of module/package aggregators.
5. Add a standard `./navigation` export for each preinstalled package that contributes static navigation.
6. Update `voyzu compose` to discover preinstalled page-route and navigation surfaces and generate the two indexes.
7. Update the web surface configuration to consume the generated indexes rather than importing complete preinstalled package definitions for page/navigation composition.
8. Add compose/runtime tests proving that route matching works and that the generated index source does not import `voyzu-package` or module aggregators.

---

# Non-goals / guardrails

This change must not:

- migrate packages in the `voyzu-packages` repository;
- redesign API composition;
- redesign commands;
- convert page implementations into string entry points;
- duplicate page route metadata into generated files;
- duplicate navigation metadata into generated files;
- require AST parsing to recover import paths;
- change the package's developer-facing page metadata unnecessarily;
- redesign the catch-all page routing model.

The central architectural rule is:

> Preinstalled page and navigation manifests are globally composable metadata. Executable page code stays behind lazy imports, and `voyzu compose` generates only the indexes needed to join those manifests into the application.
