# Shared React components

Shared business components live in `lib/ui-business-components/` and export through `@voyzu/ui-business-components`. Packages consume them by direct import; no component registration or discovery is required. Generic controls live in `@voyzu/ui-components`.

## Audit panel

`AuditPanel` supplies the shared audit/system-information panel:

```tsx
import { AuditPanel, type AuditPanelProps } from "@voyzu/ui-business-components";
```

The caller supplies metadata, an audit link and a navigation callback. The panel uses platform styling and the current access context. It does not retrieve audit history; Audit routes retain their own authorization checks.

## Organization switcher

The same platform library exports the organization switcher:

```tsx
import { OrganizationSwitcher } from "@voyzu/ui-business-components";
```

Consumers declare the platform library dependency in their package manifest.

The switcher uses the platform `ContextSwitcher` control and styling. It accepts `isCollapsed`, `allCompanies`, an optional `selectionUrl` and an `onSelected(organizationId)` callback. Organization owns the default selection endpoint; Finance supplies its filtered selection endpoint.

## Existing registry infrastructure

The client-component registry remains available but has no current registrations. These two components no longer use it. The separate server `ComponentSlot` API is unchanged.
