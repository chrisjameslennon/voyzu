# @voyzu/ui-business-components

Platform React components that integrate with Voyzu business functionality. Generic controls live in `@voyzu/ui-components`; this library combines those controls with business HTTP API behavior.

`AuditPanel` and `AuditPanelProps` are exported from this library. The caller supplies audit metadata, an audit URL and a navigation callback. The panel displays the metadata and uses the platform access context to control the audit-history link; it does not fetch audit history.

```tsx
import { OrganizationSwitcher } from "@voyzu/ui-business-components";

<OrganizationSwitcher isCollapsed={false} onSelected={() => router.refresh()} />;
```

`OrganizationSwitcher` uses Organization's `/api/organization-selection` HTTP endpoint. Consumers can supply `selectionUrl` for a filtered selection endpoint, and `allCompanies` for the disabled all-companies display. Its component and props are platform-owned; consumers do not import the Organization package. The library is a client entry point and does not call the server-only internal API from the browser.
