# Voyzu compose

Composition registers installed packages with the Voyzu web and HTTP API surfaces.
End users normally run it through the generated project script:

```shell
npm run voyzu:compose
```

To regenerate the composition without running the workspace dependency
installation, pass `--no-install`:

```shell
npm run voyzu:compose -- --no-install
```

Package inventory reconciliation and HTTP API reference generation still run.

For HTTP API or documentation contract changes, use `npm run voyzu:compose -- --surfaces-only`.
This validates HTTP contracts and page references, then refreshes HTTP API,
page/navigation registries and reference documentation. It leaves internal API
composition, dependency installation, database inventory and the Next.js cache alone.

`voyzu:install-package` invokes compose automatically.

Installed packages are discovered beneath `.run/packages` using their
npm namespace:

```text
.run/packages/
├─ @voyzu/
│  └─ ice-creams/
└─ @acme/
   └─ inventory/
```

An included package must:

- set `voyzu.voyzu-package` to `true`;
- declare `voyzu.dependencies` and `voyzu.pageRootPaths` arrays;
- declare HTTP roots and routes in `contracts.httpApiRouting`, with documentation in `contracts.httpApiDocumentation`;
- declare a repository URL matching the source Git checkout;
- export `./voyzu-package`;
- contain `voyzu.package.ts` with a module, an API contract or database installation files.

Packages marked `voyzu.preinstalled` are supplied directly by the platform.
They are excluded from installed-package composition, but compose discovers
their exported `./<module>/pages.routes`, package HTTP API contracts, and optional
`./navigation` surfaces to generate the platform page-route, HTTP API-route, and
navigation indexes. Installed runtime
packages cannot declare themselves preinstalled.

Packages may export `./navigation/top-nav` and `./navigation/left-nav` when they
contribute application navigation.

`voyzu.allowInstall` must be `true` when a package is installed. Once copied
into the runtime, package visibility is controlled only by Package Management.

The composer:

1. discovers preinstalled page-route, HTTP API-route, and navigation surfaces;
2. generates the preinstalled page-route, HTTP API-route, and navigation indexes;
3. discovers the installed package set from `.run/packages`;
4. adds package workspace dependencies to the web application;
5. adds package names to Next.js `transpilePackages`;
6. generates installed-package navigation, HTTP API, command, and component registries;
7. publishes each package's optional `public-assets` directory beneath
   `apps/web/public/<full-package-name>`;
8. runs the runtime workspace installation.

Step 8 is skipped when `--no-install` is supplied.

For example, `@acme/inventory/public-assets/logo.svg` is published as
`apps/web/public/@acme/inventory/logo.svg` and served at
`/@acme/inventory/logo.svg`. Composition replaces the package-owned target
directory, and removing a package removes its previously composed assets.

The lower-level command remains available for platform development:

```shell
node lib/runtime-tools/compose/voyzu-compose.mjs \
  --packages-root ../packages \
  --runtime . \
  --workspace .. \
  --no-install
```
