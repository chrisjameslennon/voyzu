# UI Surface Contract

The Voyzu platform has the concept of a UI Surface. This conceptualises the web browser display as a number of slots. Packages can interact with these slots by declaring that they provide content into a given slot in their `voyzu.package.ts` file.

The UI Surface also interacts with the [Page routing contract](./page-routing-contract.md), for example navigation items also declare page identifiers, and populate the breadcrumbs slot.

A high level diagram of the UI surface with slots marked in purple:

![alt text](image-2.png)

### Slots

- topnav.menu

- leftnav.header

- leftnav.menu



## Declaring and supplying Slot content

Packages declare content to fill UI Surface slots in their root voyzu.package.ts file, using the contracts `uiPlatformSurface` nosw

By convention slot content resides in a package's top level `ui-surface` folder

## Examples


```ts
// voyzu.package.ts

import financeLeftNav from "./navigation/finance.left-nav";

export default {
  contracts: {
    platformSurface: {
      // Add Finance as a destination in the platform's top menu.
      "platform.surface.topNav": [
        {
          finance: {
            label: "Finance",
            icon: "account_balance",
            // Link to a registered page using its stable route ID.
            routeId: "finance.journals.list",
          },
        },
      ],

      "platform.surface.leftNav": [
        {
          // References the top-navigation item's ID.
          topNavItem: "finance",
          // Supply the menu shown when Finance is selected.
          content: financeLeftNav,

          // Place package-specific controls above the left menu.
          header: {
            loadComponent: () =>
              import("./navigation/left-nav-header")
                .then(module => module.default),
          },
        },
      ],
    },
  },
};
```

```ts
// ui-surface/finance.left-nav.ts

export default [
  {
    // A heading groups related menu items.
    label: "Accounting",
    // Object keys identify menu items independently of their labels.
    items: {
      "finance.general-ledger": {
        label: "General Ledger",
        icon: "account_balance",
        // A parent item groups child destinations in a submenu.
        children: {
          "finance.journal-entries": {
            label: "Journal Entries",
            routeId: "finance.journals.list",
          },
          "finance.account-activity": {
            label: "Account Activity",
            routeId: "finance.account-activity.list",
          },
        },
      },
      "finance.financial-periods": {
        label: "Financial Periods",
        icon: "calendar_month",
        routeId: "finance.financial-periods.list",
      },
    },
  },
  {
    label: "Operations",
    items: {
      "finance.accounts-receivable": {
        label: "Accounts Receivable",
        icon: "receipt_long",
        children: {
          "finance.ar-invoices": {
            label: "Invoices",
            routeId: "finance.invoices.list",
          },
          "finance.ar-counterparties": {
            label: "Counterparties",
            routeId: "finance.ar-counterparties.list",
          },
        },
      },
    },
  },
];
```

```tsx
// ui-surface/left-nav-header.tsx

"use client";

import { FinanceCompanySwitcher } from "@voyzu/finance/organization-finance/client";

export default function FinanceLeftNavHeader({
  // Adapt the company selector to the platform's navigation layout.
  presentation,
}: {
  presentation: "expanded" | "collapsed" | "mobile";
}) {
  return (
    <FinanceCompanySwitcher
      companyPath="/finance/journals"
      isCollapsed={presentation === "collapsed"}
    />
  );
}
```


## Navigation selection

Each top-navigation item maps to a page-routing root. All pages declared under that root select its top-navigation item, left menu and header—even pages absent from the menu. For example, `/finance/journals/JNL-001` selects Finance because its route belongs to `pageRouting.roots["/finance"]`. No separate list of route IDs is needed.

## Changes needed (temporary)

Refactor the existing UI surface engine. Root-grouped page routing and route membership are already implemented.

- [ ] Align the contract name and examples: the prose uses `uiPlatformSurface`, while the example uses `platformSurface`. Use the three declared slot names (`topnav.menu`, `leftnav.header`, `leftnav.menu`) consistently, with the header declared separately from the menu.
- [ ] Define contribution ordering, how multiple packages contribute to the same menu, and how conflicting headers are handled. Specify how packages target the platform's Settings menu without adding their own top-navigation item.
- [ ] Add the chosen UI surface contract to `PackageContracts`, with types for slot contributions, stable menu-item keys, recursive `items`/`children` objects, route references and lazy header loaders.
- [ ] Make composition read contributions from `voyzu.package.ts`. Replace discovery through `./navigation` and `./navigation/left-nav-header` exports, and generate registries for the three slots without invoking component loaders during composition.
- [ ] Validate slot names, contribution shapes, identifier uniqueness, route and top-navigation references, and root ownership. Resolve each top-navigation destination to its declared page root and apply the agreed ordering and conflict rules.
- [ ] Adapt the existing top menu, left menu and header rendering to the composed contributions. Preserve menu-item keys and declaration order when converting object maps for the existing menu components, and carry through labels and icons.
- [ ] Use the resolved route's root membership to select all three contributions, including on direct links to detail pages. Replace the remaining domain-based navigation declarations and package-level selection fallbacks; keep remembered-page navigation scoped to the selected root.
- [ ] Load header components through their declared loaders and supply `presentation: "expanded" | "collapsed" | "mobile"`. Render the contributed header in both desktop navigation and the mobile drawer, replacing the separate header-root exports and existing header props.
- [ ] Migrate pre-installed packages, installed packages and package templates. Move contribution files from `navigation/` to `ui-surface/`, update imports and package exports, and remove obsolete registration code without compatibility adapters.
- [ ] Preserve package visibility and navigation ordering, route authorization, Settings navigation, generated HTTP API navigation, and unframed-page behaviour while changing the contribution mechanism.
- [ ] Update the related guides and examples, include the new registries in `--routing-only` composition, sync the development runtime, refresh composition and run platform/runtime typechecks. Remove this temporary section when the refactor is complete.
