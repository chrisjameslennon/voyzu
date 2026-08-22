# Documentation and help

Voyzu packages may publish documentation with any documentation provider. The package declares where its published documentation begins, and each page route declares the path to the relevant help page.

## Organize documentation

Keep documentation source inside the package that it documents. For consistency across packages, apart from the package's root `README.md`, all package documentation should reside in the package-root `docs` directory. Public-facing documentation, including source published as online help, should reside in `docs/public`.

```
packages/@acme/warehousing/
├─ README.md                      # Package overview only
├─ modules/
├─ docs/
│  ├─ architecture.md            # Package-internal documentation
│  └─ public/
│     ├─ README.md                # Public documentation entry point
│     └─ stock/
│        └─ stock-items.md        # Public online-help source
├─ package.json
└─ voyzu.package.ts
```

## Publishing Help

If your package will publish help online, the recommendation is to publish it directly from the package's GitHub repository. Configure GitBook, another hosted documentation service, or your own web server to publish those files, then put the resulting public URL in the package metadata as described below.

## Declare the help base

Set `voyzu.settings.helpBaseUrl` in the package's `package.json`. This is the public base URL for that package's documentation and may point to any HTTP or HTTPS documentation provider.

```json
{
  "name": "@acme/warehousing",
  "voyzu": {
    "voyzu-package": true,
    "allowInstall": true,
    "settings": {
      "helpBaseUrl": "https://docs.acme.example/warehousing/"
    }
  }
}
```

The help base belongs to the package rather than the Voyzu installation. This allows installed packages from different publishers to use different documentation sites.

## Connect a page to help

The Voyzu platform UI surface provides a help icon on the top right. It will be visible when the viewed page is linked to an online help URL as follows.

Set `helpPath` on each page route that has contextual documentation. The path is resolved against the owning package's `helpBaseUrl`.

```ts
// packages/@acme/warehousing/modules/stock/pages.routes.ts
export const pageRoutes = {
  list: {
    id: "acme.stock.page.list",
    path: "/stock",
    Page: StockListPage,
    pageTitle: "Stock",
    helpPath: "/stock/stock-items",
    auth: { required: true, minRole: "STANDARD" },
  },
} as const;
```

With the example settings, Voyzu opens:

```
https://docs.acme.example/warehousing/stock/stock-items
```

The surface shows the Help action only when the active route has a `helpPath` and its package has a `helpBaseUrl`. Use stable published paths; do not derive documentation paths from application URLs.
