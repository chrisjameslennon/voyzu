# Voyzu compose

Composition registers installed packages with the Voyzu web and API surfaces.
End users normally run it through the generated project script:

```shell
npm run voyzu:compose
```

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
- declare `voyzu.dependencies`, `voyzu.pageRootPaths` and `voyzu.apiRootPaths` arrays;
- declare a repository URL matching the source Git checkout;
- export `./voyzu-package`;
- contain `voyzu.package.ts` with at least one module or database installation file.

Packages marked `voyzu.preinstalled` are supplied directly by the platform.
They are excluded from installed-package composition, but compose discovers
their exported `./<module>/pages.routes`, `./<module>/api.routes`, and optional
`./navigation` surfaces to generate the platform page-route, API-route, and
navigation indexes. Installed runtime
packages cannot declare themselves preinstalled.

Packages may export `./navigation/top-nav` and `./navigation/left-nav` when they
contribute application navigation.

`voyzu.allowInstall` must be `true` when a package is installed. Once copied
into the runtime, package visibility is controlled only by Package Management.

The composer:

1. discovers preinstalled page-route, API-route, and navigation surfaces;
2. generates the preinstalled page-route, API-route, and navigation indexes;
3. discovers the installed package set from `.run/packages`;
4. adds package workspace dependencies to the web application;
5. adds package names to Next.js `transpilePackages`;
6. generates installed-package navigation, API, and command registries;
7. publishes each package's optional `public-assets` directory beneath
   `apps/web/public/<full-package-name>`;
8. runs the runtime workspace installation.

For example, `@acme/inventory/public-assets/logo.svg` is published as
`apps/web/public/@acme/inventory/logo.svg` and served at
`/@acme/inventory/logo.svg`. Composition replaces the package-owned target
directory, and removing a package removes its previously composed assets.

The lower-level command remains available for platform development:

```shell
node lib/runtime-tools/compose/voyzu-compose.mjs \
  --packages-root ../packages \
  --runtime . \
  --workspace ..
```
