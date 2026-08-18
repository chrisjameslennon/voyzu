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

Packages marked `voyzu.preinstalled` are supplied directly by the platform and
are excluded when composing the platform source tree. Installed runtime
packages cannot declare themselves preinstalled.

Packages may export `./navigation/top-nav` and `./navigation/left-nav` when they
contribute application navigation.

`voyzu.allowInstall` must be `true` when a package is installed. Once copied
into the runtime, package visibility is controlled only by Package Management.

The composer:

1. discovers the package set from `.run/packages`;
2. adds package workspace dependencies to the web application;
3. adds package names to Next.js `transpilePackages`;
4. generates page, navigation, and API registries;
5. publishes each package's optional `public-assets` directory beneath
   `apps/web/public/<full-package-name>`;
6. runs the runtime workspace installation.

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
