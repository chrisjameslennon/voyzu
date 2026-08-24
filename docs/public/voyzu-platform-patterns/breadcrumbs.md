# Breadcrumb patterns

Breadcrumbs sit at the boundary between the Voyzu application surface and a
module page. Ownership is deliberately split across three parts:

* The **module page owns presentation**. It places the `Breadcrumbs` control in
  the appropriate page-layout slot alongside the heading and actions.
* The **module route owns hierarchy**. The matched route defines the
  breadcrumb path in `breadcrumbBase`, including ancestor labels and canonical
  links. The module page must not duplicate or override that stable path.
* The shared **React control is the intermediary**. The surface wraps the page
  in `BreadcrumbsProvider`; `Breadcrumbs` reads the matched route's base from
  React context and renders it where the module placed the control. This keeps
  route knowledge in the route declaration while leaving page composition
  inside the page component.

The page heading must not appear in the breadcrumbs. Breadcrumbs show the
navigation path leading to the page; they do not list the page itself. The
heading already identifies the current page.

## How breadcrumbs are composed

The surface router wraps a framed page in `BreadcrumbsProvider` and passes the
route's `breadcrumbBase`:

```tsx
<BreadcrumbsProvider base={route.breadcrumbBase ?? []}>
  {page}
</BreadcrumbsProvider>
```

The module renders `Breadcrumbs` in the standard header slot:

```tsx
<div className={layout.slotBreadcrumb}>
  <Breadcrumbs />
</div>
```

The component resolves its items as follows:

```text
Desktop: surface breadcrumbBase + optional module slugs
Mobile:  breadcrumbs are not rendered; the compact H1 identifies the page
```

The current page is represented by its heading at every viewport, so it is not
repeated in `breadcrumbBase` or `slugs`.

## Define the route hierarchy

Set `breadcrumbBase` beside `path` and `Page` in the module's top-level
`pages.routes.ts`.

For a list page, provide the stable surface area and any navigation group:

```ts
{
  id: "acme.stock.page.list",
  path: "/warehousing/stock",
  Page: StockListPage,
  breadcrumbBase: [
    { label: "Warehousing", href: "/warehousing/stock" },
  ],
}
```

For a detail page, add the containing list as the final base item:

```ts
{
  id: "acme.stock.page.detail",
  path: "/warehousing/stock/[code]",
  Page: StockDetailPage,
  breadcrumbBase: [
    { label: "Warehousing", href: "/warehousing/stock" },
    { label: "Stock", href: "/warehousing/stock" },
  ],
}
```

Use an `href` only when the item has a meaningful destination. A grouping label
may be plain text when no group landing page exists. Breadcrumb links must use
canonical application paths, not a `from` query parameter or browser history.

## Render the module breadcrumb

Import `Breadcrumbs` from `@voyzu/ui-components` and render it in
`layout.slotBreadcrumb`.

List pages render the surface-provided ancestor path:

```tsx
<div className={layout.slotBreadcrumb}>
  <Breadcrumbs />
</div>
```

Detail pages use the same pattern. The record name or code belongs in the page
heading, not in the breadcrumb:

```tsx
<div className={layout.slotBreadcrumb}>
  <Breadcrumbs />
</div>
```

Do not include the current label in `breadcrumbBase` or `slugs`.

## Module-owned extra segments

Use `slugs` only when a module needs to append intermediate segments that are
not known by the static surface route. They are added after `breadcrumbBase`:

```tsx
<Breadcrumbs
  slugs={[{ label: sectionName, href: sectionHref }]}
/>
```

Keep stable hierarchy in `breadcrumbBase`. Do not move it into every module
page merely because `slugs` can express it.

## Mobile pages

Breadcrumbs are desktop-only. The shared `Breadcrumbs` control and page layouts
hide the breadcrumb and collapse its grid row below `768px`.

The page H1 remains visible at the mobile title size and identifies the current
list, detail, or report. Do not create a separate mobile breadcrumb, pass a
mobile label, or hide the page heading in module CSS. Responsive breadcrumb and
heading behavior belongs to the shared UI control and layouts.

## Unframed pages

The surface does not install `BreadcrumbsProvider` for `unframed` routes.
Printable reports, authentication screens, and other unframed pages should not
render the normal application breadcrumb. Their surrounding document or
workflow supplies the required context.

## Checklist

Before completing a new page:

1. Register its stable ancestors in the module route's `breadcrumbBase`.
2. Link only ancestors with real canonical destinations.
3. Render `Breadcrumbs` in `layout.slotBreadcrumb`.
4. Keep the current page heading, record name, and record code out of the trail.
5. Use `slugs` only for genuinely module-owned intermediate context.
6. Verify the ancestor path on desktop and the compact H1 without breadcrumbs
   on mobile.

## See also

* [Application surface patterns](app-surface.md)
* [UI patterns](ui-reference.md)
* [Authentication](authentication.md)
