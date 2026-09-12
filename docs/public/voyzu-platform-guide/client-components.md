# Shared React components

Shared platform components live in `components/`, alongside `lib/`. Packages consume them by direct import; no component registration or discovery is required.

## Audit panel

`components/audit-panel` supplies the shared audit/system-information panel:

```tsx
import { AuditPanel, type AuditPanelProps } from "@voyzu/components/audit-panel";
```

The caller supplies metadata, an audit link and a navigation callback. The panel uses platform styling and the current access context. It does not retrieve audit history; Audit routes retain their own authorization checks.

## Organization switcher

ERP Core exposes its organization switcher through the deliberate public entry point `exports/components`:

```tsx
import { OrganizationSwitcher } from "@voyzu/erp-core/exports/components";
```

This is an explicit upstream dependency on ERP Core, not an import of its package manifest or private modules. Consumers declare the dependency in their package manifest.

The switcher uses the platform `ContextSwitcher` control and styling. It accepts `isCollapsed`, `allCompanies`, an optional `selectionUrl` and an `onSelected(organizationId)` callback. ERP owns the default selection endpoint and DTO handling; Finance supplies its filtered selection endpoint.

## Existing registry infrastructure

The client-component registry remains available but has no current registrations. These two components no longer use it. The separate server `ComponentSlot` API is unchanged.
