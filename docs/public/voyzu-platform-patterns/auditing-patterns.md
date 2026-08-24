# Auditing patterns

Auditing in Voyzu is database-backed. Application code supplies actor and mutation information; PostgreSQL triggers stamp rows and write detailed audit events.

Every audit event belongs to exactly one Voyzu package. The package code is declared when the package attaches its trigger and is stored as a non-null `audit_event.package_code` value.

An audit organization ID may be null for platform-level or pre-organization data. PostgreSQL permits a null foreign key while still enforcing the relationship when a non-null organization ID is supplied.

## High-level flow

1. A service creates an audit stamp for the current request context.
2. The service adds the stamp to the row being inserted, updated, or deleted.
3. A trigger writes the entity event and its changed fields to the audit tables.
4. Changes that share a mutation ID can be presented as one user action.

If actor details are absent, for example if a database change is made directly, the trigger still records the change as a system operation.

## Standard audit fields

Audited tables contain creation, update, and deletion fields:

```sql
creation_date            audit_timestamp,
creation_actor_type      actor_type,
creation_user_id         text,
creation_mutation_id     uuid,

updated_date             audit_timestamp,
updated_actor_type       actor_type,
updated_user_id          text,
updated_mutation_id      uuid,

deletion_date            audit_timestamp,
deletion_actor_type      actor_type,
deletion_user_id         text,
deletion_mutation_id     uuid
```

`actor_type` is `APP`, `API`, or `SYSTEM`.

## Attach the trigger

Every audited table must use the shared audit trigger:

```sql
-- packages/@acme/warehousing/install/schema.sql
drop trigger if exists stock_audit_trigger on stock;

create trigger stock_audit_trigger
before insert or update or delete on stock
for each row execute function audit_trigger_fn('@acme/warehousing');
```

The trigger writes to `audit_event` and `audit_change`. Update events contain only fields whose values changed. The trigger rejects attachments that do not supply a non-blank package code.

## Supply audit information

Import audit-stamp helpers from the public audit package:

```ts
// packages/@acme/warehousing/modules/stock/server/lib/stock.service.ts
import {
  createUpdateAuditStamp,
  withUpdateAudit,
} from "@voyzu/audit/stamps";

const audit = await createUpdateAuditStamp();
const row = withUpdateAudit(
  {
    name: input.name,
    supplier_code: input.supplierCode,
  },
  audit,
);

await stockRepo.patch(code, row);
```

Use `createCreationAuditStamp` and `withCreationAudit` for inserts. Services that perform several related mutations should reuse one mutation ID.

## Deletions

Stamp deletion fields before deleting a row. The delete trigger can then copy the correct actor and mutation details into the permanent audit event.

```ts
// packages/@acme/warehousing/modules/stock/server/db/stock.repo.ts
await db.query(
  `
  update stock
  set deletion_date = $2,
      deletion_actor_type = $3::actor_type,
      deletion_user_id = $4,
      deletion_mutation_id = $5::uuid
  where code = $1
  `,
  [code, audit.timestamp, audit.actorType, audit.userId, audit.mutationId],
);

await db.query("delete from stock where code = $1", [code]);
```

Both statements must run in the same transaction.

## Return audit metadata

Use the shared audit DTOs from `@voyzu/types` rather than redefining actor and metadata shapes in each package. Map database audit columns to those DTOs in the package mapper.

Audit links may filter by entity type, entity ID, entity code, or mutation ID. Use the mutation ID when several database changes represent one user action.

## Display audit information

The `@voyzu/audit` package provides a deliberately dumb `AuditPanel` component for detail pages. It displays the entity ID and supplied creation and update information. It does not fetch audit data, select audit records, or decide where the user should go.

The calling package supplies the audit metadata. It may also supply both `auditHref` and `onNavigate` to display a **View audit information** button and control its destination. If either property is omitted, the panel displays the system information without the button.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { AuditPanel } from "@voyzu/audit/client";

export function StockItemAuditPanel({ stockItem }: StockItemAuditPanelProps) {
  const router = useRouter();

  return (
    <AuditPanel
      id={stockItem.id}
      creationDate={stockItem.audit.created.date}
      creationActorType={stockItem.audit.created.actorType}
      creationUser={stockItem.audit.created.user}
      updatedDate={stockItem.audit.updated.date}
      updatedActorType={stockItem.audit.updated.actorType}
      updatedUser={stockItem.audit.updated.user}
      auditHref={
        `/warehousing/audit?entityType=stock_item&entityId=${stockItem.id}` +
        `&from=stock-item&fromCode=${encodeURIComponent(stockItem.code)}`
      }
      onNavigate={(href) => router.push(href)}
    />
  );
}
```

The calling package owns the audit list page and its navigation behavior. Its `auditHref` should identify the entity using `entityType` with `entityId` or `entityCode`, or use `mutationId` when the link should show one business mutation. It should also carry enough return context for the audit page's Back button to return to the originating detail page. The panel itself does not assume any package routes or use UI components from a business package.

## Query audit events

Voyzu exposes one package-neutral audit API from `@voyzu/audit`:

```
GET /api/audit
GET /api/audit/count
GET /api/audit/export
GET /api/audit/{id}
```

List, count, and export accept `packageCode`, `organizationId`, `entityType`, `entityCode`, `entityId`, `mutationId`, `actorId`, date, and search filters. Omitting `packageCode` intentionally queries across packages; no separate cross-package permission is required for an authenticated API caller.

Packages own their audit list and detail pages. They may use the neutral audit DTOs and API, but must not reuse another business package's audit UI.

## Package dependency

A package that uses audit helpers or audit tables must declare `@voyzu/audit` as a peer dependency. Audit is preinstalled by Voyzu, so it is not listed in the package's `voyzu.dependencies` array.

The platform creates nullable `audit_event.organization_id` without a foreign key because Audit is installed independently of ERP Core. ERP Core adds the organization foreign key after it creates the `organization` table. Packages without an organization scope leave `organization_id` null. Deleting an organization sets the audit reference to null so the permanent audit history remains.
