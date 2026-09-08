# Client-component composition

Client components use an explicit registry separate from server `ComponentSlot`.
Use this when an implementation must render within a client screen and receive live
state or callbacks. Existing server component registration is unchanged.

## Declare and compose

Export `./<module>/client-components` from the package manifest, pointing to a
declaration module. Register the same collection as the module's `clientComponents`.
Declarations contain only metadata and lazy loaders; no eager UI or server imports.

```ts
import type { VoyzuClientComponentDefinition } from "@voyzu/ui-surface/types";

export const clientComponents = {
  auditPanel: {
    id: "audit.panel",
    loadComponent: () => import("./client/AuditPanel").then(m => m.AuditPanel),
  },
} as const satisfies Record<string, VoyzuClientComponentDefinition>;
```

`voyzu:compose` validates declaration shape and duplicate client identities without
loading implementations, and generates `.generated/components/client.tsx`. An empty
registry is valid. New registrations require compose; normal implementation edits
follow development file watching. The generated client provider is mounted by the
web layout, so functions are never passed through a server/client serialization boundary.

## Consume

```tsx
import { clientComponent } from "@voyzu/ui-surface/client";
const AuditPanel = clientComponent.use("audit.panel"); // Module-scope adapter, not a React hook

// In the detail screen:
// <AuditPanel {...metadata} onNavigate={href => router.push(href)} />
```

Or use `ClientComponentSlot` with `name`, `componentProps`, `optional` and `fallback`.
Required missing registrations throw; optional missing registrations render nothing.
The default Suspense fallback is null. Loader failures propagate to the application's
error boundary. Component props are defined by the platform's `ClientComponentContracts`
interface (extensible via declaration merging), not by imports from the provider.

Implementations are React client modules and cannot import server-only code. Props
and callbacks stay client-side and update normally after saves. The registry/provider
adds no DOM wrapper or presentation styling. Components use platform layout and
presentation CSS; genuinely package-specific CSS stays with the implementation and
is imported as `localStyles`. CSS imports are handled by Next.js, not a second registry.

`audit.panel` is the first implementation. It combines the former AuditPanel and
SystemInformationCard; there is no separate generic card export. Audit history stays
internal to Audit. Permission display uses the platform access context, never replaces
server authorization, and fails closed when that context is absent.

## Organization switcher

ERP Core implements `erp.organization-switcher`, using the existing generic
`ContextSwitcher` control and platform styling. Consumers use
`clientComponent.use("erp.organization-switcher")` with `isCollapsed` and an optional
`onSelected(organizationId)` callback for local navigation. No ERP import is needed.

ERP owns its default selection endpoint and DTO handling. A consumer may supply a
`selectionUrl` for its own GET/PUT selection endpoint with the same wire shape;
Finance uses this to retain its finance-enabled organization filter. Server-side
consumers use the ERP organization-context capability, never cookie constants.
