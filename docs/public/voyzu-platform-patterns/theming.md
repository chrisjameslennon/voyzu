# Applying the Voyzu theme

Voyzu applies one application-wide theme. The platform owns the theme, fonts, logo, and global CSS. A package consumes that theme; the package contract does not allow a package to replace the theme for the composed application.

Package pages should therefore use Voyzu's shared components, CSS modules, and public design tokens. This keeps the package consistent with the rest of the application and allows it to follow future platform theme changes automatically.

## Use shared Voyzu styles

Use components from `@voyzu/ui-components` and the established layout and style modules where they fit the page:

```tsx
import { Button } from "@voyzu/ui-components";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
```

The shared modules already apply Voyzu's colors, typography, spacing, borders, and interaction states. Prefer them to copying their declarations into package-owned stylesheets.

## Use public design tokens

When a package needs its own CSS, use the public `--voyzu-*` semantic tokens rather than fixed values or Voyzu's internal implementation variables:

```css
.summaryCard {
  color: var(--voyzu-color-text);
  background: var(--voyzu-color-surface);
  border: var(--voyzu-border-width) solid var(--voyzu-color-border);
  border-radius: var(--voyzu-radius-surface);
  box-shadow: var(--voyzu-shadow-surface);
  padding: var(--voyzu-space-section);
}

.summaryCardLink {
  color: var(--voyzu-color-link);
}

.summaryCardLink:hover {
  color: var(--voyzu-color-link-hover);
}
```

The public tokens cover:

* brand and primary interactions;
* application backgrounds, surfaces, borders, and text;
* success, warning, danger, information, and neutral states;
* typography, spacing, control sizing, and border radii; and
* shadows, scrollbars, and motion.

Variables beginning with `--voyzu-` are the public styling contract. Variables beginning with `--_`, `--wa-`, or `--tw-` are platform implementation details and packages must not depend on them.

Choose tokens by meaning rather than by their current appearance. For example, use `--voyzu-color-danger` for a destructive action and `--voyzu-color-surface` for a card background. Do not select a token merely because its present color matches the design.

## Package-owned styling

A package may use its own CSS modules and visual layout inside its pages. Scope those styles to the package components and continue to use Voyzu tokens where the design shares platform semantics.

A package must not override Voyzu tokens on `:root`, replace global platform styles, or change the logo. Such changes affect every installed package and therefore belong to the Voyzu platform rather than an individual package.

## Inspect the theme

Run Voyzu and open its preinstalled UI Reference package:

```shell
npm run dev
```

The color-token reference is available at `http://localhost:3000/ui-reference/css-variables/colors`. The component and CSS-module examples show how the current theme is applied in practice.

Check package pages at desktop and mobile widths. Review focus, hover, disabled, and feedback states as well as text contrast and wrapping. A package should preserve the semantic meaning of success, warning, danger, and information states.

## Modify the platform theme

The Voyzu platform source is available in an installed workspace beneath `.run/voyzu`, so it is technically possible to change the application-wide theme.

{% hint style="warning" %}
Changing files beneath `.run` is not recommended. The runtime workspace is ephemeral, and `voyzu:refresh`, updates, or recreation may overwrite these changes. Voyzu does not currently provide a supported application-branding contract. Maintain durable theme changes in your own Voyzu platform source rather than relying on edits made directly in `.run`.
{% endhint %}

If a temporary platform customization is required, create `.run/voyzu/apps/web/app/theme.css`, override the public tokens at `:root`, and import it after the default tokens in `.run/voyzu/apps/web/app/(web)/layout.tsx`:

```css
:root {
  --voyzu-color-brand: #006c67;
  --voyzu-color-brand-hover: #005752;
  --voyzu-color-brand-soft: #d9f0ee;
  --voyzu-color-brand-subtle: #eff9f8;
}
```

```ts
import "@voyzu/ui-style/css/design-tokens.css";
import "../theme.css";
```

The custom stylesheet must be imported after `design-tokens.css` so its values win the CSS cascade. Rebuild and restart the web application after changing platform source.

## Change the logo

The logo displayed in the desktop and mobile platform navigation is:

```text
.run/voyzu/apps/web/public/voyzu/voyzu_color_logo_transparent.png
```

To change it temporarily, replace that file with the new logo while retaining the same filename and path, then rebuild and restart the web application. Use a transparent image that remains legible at the compact navigation size.

To use a different filename, file type, or public path, place the asset beneath `.run/voyzu/apps/web/public` and update the `src` value in:

```text
.run/voyzu/apps/web/app/(web)/surface/top-nav/VoyzuBrand.tsx
```

Also update the image alternative text when the displayed brand changes. These logo changes have the same ephemeral status as other direct `.run` modifications; keep durable replacements in maintained Voyzu platform source.

<figure><img src="../.gitbook/assets/image (6).png" alt="Voyzu UI Reference color variable page"><figcaption><p><a href="http://localhost:3000/ui-reference/css-variables/colors">UI Reference color variables</a></p></figcaption></figure>
