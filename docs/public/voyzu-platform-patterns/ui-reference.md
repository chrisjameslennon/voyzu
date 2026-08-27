# UI patterns

Voyzu provides a pre-installed UI Reference package for the components, styles, and responsive patterns used by application modules. Treat the running reference pages and the exported TypeScript types as the source of truth for a component's current API.

## Open the UI Reference

Start the Voyzu application from the repository root:

```shell
npm run dev
```

Sign in and open `http://localhost:3000/ui-reference`. The reference includes interactive examples, import statements, props, and usage code. Use it before creating module-specific UI.

<figure><img src="../.gitbook/assets/image (9).png" alt=""><figcaption><p><a href="http://localhost:3000/ui-reference">http://localhost:3000/ui-reference</a></p></figcaption></figure>

## Choose the correct package

| Package                | Use it for                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `@voyzu/ui-components` | Reusable controls and interaction patterns such as buttons, inputs, tables, dialogs, filters, navigation, alerts, and validation               |
| `@voyzu/ui-layout`     | Page arrangement, responsive breakpoints, and the standard list, detail, create, and report layouts                                            |
| `@voyzu/ui-style`      | Design tokens, reset styles, typography, forms, list/detail styling, and modal styling                                                         |
| `@voyzu/ui-surface`    | The application shell, route surface, detail navigation, and surface slots; modules normally consume the configured surface rather than creating one |

Import components and their types from the package root:

```tsx
import {
  Button,
  DataTable,
  Input,
  type DataTableColumn,
} from "@voyzu/ui-components";
```

Import shared CSS modules through their exported package paths:

```tsx
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
```

Do not import files using relative paths into another package's `src` directory. Public package exports define the supported boundary.

## Global UI styles

The application root loads the shared reset, breakpoints, grid, and design tokens once:

```tsx
import "@voyzu/ui-style/css/reset.css";
import "@voyzu/ui-layout/css/breakpoints.css";
import "@voyzu/ui-layout/css/layout-grid.css";
import "@voyzu/ui-style/css/design-tokens.css";
```

Module components should not import these global files again. Use the CSS custom properties defined by `design-tokens.css` instead of introducing duplicate colour, font, spacing, border, or shadow values.

## Build a module page

Start with the standard layout for the page type, then add shared components and only the small amount of module-specific CSS that remains.

```tsx
"use client";

import { Breadcrumbs, Button, Input } from "@voyzu/ui-components";
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

export function ItemsListContent() {
  return (
    <div className={layout.listView}>
      <header className={layout.listHeader}>
        <div className={layout.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layout.slotTitle}>
          <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>
            Items
          </h1>
        </div>
        <div className={layout.slotActions}>
          <Button variant="primary" icon="add">Add item</Button>
        </div>
      </header>

      <div className={layout.listToolbar}>
        <div className={layout.slotToolbarSearch}>
          <Input
            search
            containerClassName={layout.slotSearchControl}
            placeholder="Search items..."
          />
        </div>
      </div>

      <div className={layout.listBody}>
        <div className={layout.slotBody}>{/* DataTable or page content */}</div>
      </div>
    </div>
  );
}
```

Use a client component when the page needs state, event handlers, browser APIs, or responsive hooks. Keep data loading in the module's server page and pass serializable data to the client component.

## Layout and styling rules

Voyzu separates arrangement from visual treatment:

* Pages arrange sections.
* Sections arrange components, normally with Grid, Flexbox, and `gap`.
* Components own their internal padding and element arrangement.
* Elements do not create page spacing for themselves.

Prefer parent-owned `gap` over child margins. Use `@voyzu/ui-layout` for standard page structure, `@voyzu/ui-style` for shared visual treatment, and a local CSS module only for domain-specific presentation.

## Common choices

* Use `Button` for commands and provide a Material Symbol name through `icon` where appropriate.
* Use `Input`, `Checkbox`, `Radio`, `SearchableSelect`, `DatePicker`, and `ToggleSwitch` instead of restyling native controls.
* Use `DataTable` for list pages. Define stable column widths and provide selection, pagination, empty, loading, and mobile states as required by its reference page.
* Use `FilterPanel` with `FilterChips` for structured list filtering.
* Use `ConfirmDialog` for destructive or irreversible confirmation and `Toast` or `Alert` for operation feedback.
* Use the validation helpers and `ValidationAlert` for consistent client-side form validation.
* Use responsive hooks from `@voyzu/ui-layout` only when CSS cannot express the behavior.

Do not copy a reference-page preview into production without checking all states exposed by the component's props. In particular, verify disabled, error, empty, loading, selected, read-only, keyboard, mobile, and tablet behavior where applicable.

## When no shared component fits

Create a module-local component under the module's `client/` folder when the
behavior is specific to one business workflow. If a component is reused across
the package, place it in a package-owned common module and build it from shared
controls and tokens where possible. A shared package component should include:

1. The component and its CSS module under the common module's `client/` folder.
2. A controlled client barrel export from that module.
3. Optionally its own reference page with props, interactive states, and copyable usage.

Keep shared component APIs typed, focused, and independent of business DTOs. Business-specific data mapping belongs in the consuming module.
