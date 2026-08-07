# Static assets

Packages keep their images, fonts and other static files in an optional
package-root `public-assets` directory:

```text
packages/@acme/warehousing/
├─ public-assets/
│  └─ images/warehouse.jpg
├─ package.json
└─ voyzu.package.ts
```

During `voyzu:compose`, Voyzu replaces that package's asset directory in the
Next.js `public` folder, namespaced by the full package name:

```text
.run/voyzu/apps/web/public/@acme/warehousing/images/warehouse.jpg
```

The package can then use an absolute URL:

```tsx
<img src="/@acme/warehousing/images/warehouse.jpg" alt="Warehouse" />
```

Install, link, update and uninstall workflows invoke composition, so published
assets follow the package lifecycle. Packages must not write into another
package's namespace or rely on files added directly beneath `.run`.
