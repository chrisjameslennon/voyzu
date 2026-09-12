# UI Surface Contract

The Voyzu platform has the concept of a UI Surface. This conceptualises the web browser display as a number of slots. Packages can interact with these slots by declaring that they provide content into a given slot in their `voyzu.package.ts` file.

The UI Surface also interacts with the [Page routing contract](./page-routing-contract.md), for example navigation items also declare page identifiers, and populate the breadcrumbs slot.

A high level diagram of the UI surface slots below:

![alt text](image-1.png)

## Declaring Slot content

Packages declare slot content by 




## Top Nav menu and left nav header and left nav

BUT.  should live in /ui-surface not /navigation.


```ts
// voyzu.package.ts — proposed shape

import financeLeftNav from "./navigation/finance.left-nav";

export default {
  contracts: {
    platformSurface: {
      contributes: {
        "platform.surface.topNav": [
          {
            content: {
              id: "finance",
              label: "Finance",
              icon: "account_balance",
              routeId: "finance.journals.list",
            },
          },
        ],

        "platform.surface.leftNav": [
          {
            // References the top-navigation item's ID.
            topNavItem: "finance",
            content: financeLeftNav,

            header: {
              loadComponent: () =>
                import("./navigation/left-nav-header")
                  .then(module => module.default),
            },
          },
        ],
      },
    },
  },
};
```

```ts
// navigation/finance.left-nav.ts

export default [
  {
    label: "Accounting",
    items: [
      {
        id: "finance.general-ledger",
        label: "General Ledger",
        icon: "account_balance",
        children: [
          {
            id: "finance.journal-entries",
            label: "Journal Entries",
            routeId: "finance.journals.list",
          },
          {
            id: "finance.account-activity",
            label: "Account Activity",
            routeId: "finance.account-activity.list",
          },
        ],
      },
      {
        id: "finance.financial-periods",
        label: "Financial Periods",
        icon: "calendar_month",
        routeId: "finance.financial-periods.list",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: "finance.accounts-receivable",
        label: "Accounts Receivable",
        icon: "receipt_long",
        children: [
          {
            id: "finance.ar-invoices",
            label: "Invoices",
            routeId: "finance.invoices.list",
          },
          {
            id: "finance.ar-counterparties",
            label: "Counterparties",
            routeId: "finance.ar-counterparties.list",
          },
        ],
      },
    ],
  },
];
```

```tsx
// navigation/left-nav-header.tsx

"use client";

import { FinanceCompanySwitcher } from "@voyzu/finance/finance-companies/client";

export default function FinanceLeftNavHeader({
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

Also.  implementer drop down.  

and maybe identity drop down. for future.  and should really name them semantically 
